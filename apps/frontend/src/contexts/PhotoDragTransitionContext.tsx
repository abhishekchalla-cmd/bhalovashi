"use client";

import usePressEventHandlers, {
  PressEventHandler,
  ReleaseEventHandler,
} from "@/components/IOSSlider/event-handlers";
import { galleryBottomBarHeight, galleryTopBarHeight } from "@/config";
import { CoordsInstant } from "@/utils/event";
import { getEventListeners } from "events";
import { useRouter } from "next/router";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

type MediaFormat = {
  id: number | string;
  url: string;
  projectId: number;
  mediaDims: MediaDims;
};

type PhotoDragTransitionContextType = {
  initMediaTransition?: (
    mediaFormat: MediaFormat,
    dir: number,
    initialRectData?: RectData,
    isDragging?: boolean
  ) => void;
  setHasTargetPageLoaded?: () => void;
  mediaTransitionState?: MediaTransitionState;
};

export const PhotoDragTransitionContext =
  createContext<PhotoDragTransitionContextType>({});

type MediaDims = {
  width: number;
  height: number;
};

type RectData = {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
};

type MediaData = {
  src: string;
  rect: RectData;
};

type MediaTransitionState = {
  isTransitioning: boolean;
  isAnimating: boolean;
  src?: string;
  initialRectState?: RectData;
  currentRectState?: RectData;
  finalRectState?: RectData;
  dir?: number; // 1 is towards gallery, -1 is towards camera
  isDragging: boolean;
  mediaFormat?: MediaFormat;
  dragState?: {
    initialCoords: CoordsInstant;
    previousCoords: CoordsInstant;
    currentCoords: CoordsInstant;
  };
  hasTargetPageLoaded?: boolean;
};

export default function PhotoDragTransitionContextProvider(props: {
  children: React.ReactNode;
}) {
  const transitionEndTimeInMS = 250;
  const { children } = props;
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mediaTransitionState, setMediaTransitionState] =
    useState<MediaTransitionState>({
      isTransitioning: false,
      isAnimating: false,
      isDragging: false,
    });

  const handleDrag = useCallback<PressEventHandler>(
    ({ clientX, clientY, target }) => {
      const currentCoords: CoordsInstant = {
        x: clientX,
        y: clientY,
        timeStamp: new Date().getTime(),
      };
      setMediaTransitionState((v) => ({
        ...v,
        dragState: {
          initialCoords: !v.dragState?.initialCoords
            ? currentCoords
            : v.dragState.initialCoords,
          previousCoords: !v.dragState?.previousCoords
            ? currentCoords
            : v.dragState.currentCoords,
          currentCoords,
        },
      }));
    },
    []
  );

  const handleRelease = useCallback<ReleaseEventHandler>(() => {
    const dir = Math.sign(
      mediaTransitionState.dragState!.currentCoords.y -
        mediaTransitionState.dragState!.initialCoords.y
    );
    setMediaTransitionState((v) => {
      const newState = {
        ...v,
        dir,
        currentRectState: {
          ...v.currentRectState!,
          x: v.dragState!.currentCoords.x,
          y: v.dragState!.currentCoords.y,
        },
        finalRectState:
          dir === 1
            ? getMediaInGalleryState(
                mediaTransitionState.mediaFormat!.mediaDims
              )
            : getMediaInCameraState(),
        isDragging: false,
      };
      return newState;
    });
  }, [mediaTransitionState]);

  const { attachPressHandlers } = usePressEventHandlers(
    {
      onPress: () => {},
      onPressMove: handleDrag,
      onRelease: () => handleRelease,
      attachingContainerRef: containerRef,
      name: "photoDrag",
    },
    [handleDrag, handleRelease]
  );

  const initMediaTransition = useCallback(
    (
      media: {
        id: number | string;
        url: string;
        projectId: number;
        mediaDims: MediaDims;
      },
      dir: number,
      initialRectData?: RectData,
      isDragging: boolean = false
    ) => {
      const initialRectState = {
          ...(dir === 1
            ? getMediaInCameraState()
            : getMediaInGalleryState(media.mediaDims)),
          ...(initialRectData || {}),
        },
        finalRectState =
          dir === 1
            ? getMediaInGalleryState(media.mediaDims)
            : getMediaInCameraState();

      const newMediaTransitionState = {
        isTransitioning: true,
        isAnimating: false,
        src: media.url,
        initialRectState,
        currentRectState: initialRectState,
        finalRectState,
        isDragging,
        mediaFormat: media,
        dir,
      };

      setMediaTransitionState(newMediaTransitionState);
      if (isDragging) {
        router.push(`/project/${media.projectId}`);
        attachPressHandlers();
      }
    },
    [attachPressHandlers]
  );

  useEffect(() => {
    const {
      isDragging,
      isTransitioning,
      finalRectState,
      mediaFormat: media,
      dir,
      isAnimating,
      hasTargetPageLoaded,
    } = mediaTransitionState;

    if (isTransitioning && !isDragging) {
      if (!isAnimating) {
        setMediaTransitionState((v) => ({
          ...v,
          isAnimating: true,
          currentRectState: finalRectState,
        }));

        setTimeout(() => {
          if (dir === 1) {
            router.push(`/project/${media!.projectId}/${media!.id}`);
          } else {
            router.push(`/project/${media!.projectId}`);
          }
        }, transitionEndTimeInMS);
      } else if (isAnimating && hasTargetPageLoaded) {
        setMediaTransitionState((v) => ({
          isTransitioning: false,
          isAnimating: false,
          isDragging: false,
        }));
      }
    }
  }, [mediaTransitionState]);

  return (
    <PhotoDragTransitionContext.Provider
      value={{
        initMediaTransition,
        setHasTargetPageLoaded: () =>
          setMediaTransitionState((v) => ({ ...v, hasTargetPageLoaded: true })),
        mediaTransitionState,
      }}
    >
      <div className="w-max h-max relative overflow-hidden" ref={containerRef}>
        {children}

        <div
          style={{
            pointerEvents: mediaTransitionState.isTransitioning
              ? "all"
              : "none",
            opacity: mediaTransitionState.isTransitioning ? "1" : "0",
            position: "absolute",
            zIndex: "10",
            transition: mediaTransitionState.isDragging
              ? ""
              : transitionEndTimeInMS / 1000 + "s",
            ...(mediaTransitionState.isTransitioning
              ? {
                  height: mediaTransitionState.currentRectState!.height,
                  width: mediaTransitionState.currentRectState!.width,
                  borderRadius:
                    mediaTransitionState.currentRectState!.borderRadius,
                  top: mediaTransitionState.isDragging
                    ? mediaTransitionState.initialRectState!.y +
                      ((mediaTransitionState.dragState?.currentCoords.y || 0) -
                        (mediaTransitionState.dragState?.initialCoords.y || 0))
                    : mediaTransitionState.currentRectState!.y,
                  left: mediaTransitionState.isDragging
                    ? mediaTransitionState.initialRectState!.x +
                      ((mediaTransitionState.dragState?.currentCoords.x || 0) -
                        (mediaTransitionState.dragState?.initialCoords.x || 0))
                    : mediaTransitionState.currentRectState!.x,
                }
              : {}),
          }}
          className="flex items-center justify-center overflow-hidden bg-gray-900"
        >
          <div className="w-full h-full text-white flex items-center justify-center">
            LOADING...
          </div>
          <img
            src={mediaTransitionState.src}
            className="min-h-full min-w-full absolute h-full w-full top-0 left-0 z-4"
          />
        </div>

        <div
          style={{
            position: "absolute",
            zIndex: "5",
            top: "0px",
            left: "0px",
            background: "#000",
            opacity: mediaTransitionState.isTransitioning ? "1" : "0",
            pointerEvents: mediaTransitionState.isTransitioning
              ? "all"
              : "none",
            bottom: "0",
            right: "0",
            transition: mediaTransitionState.isTransitioning
              ? transitionEndTimeInMS / 1000 + "s"
              : "0.1s",
          }}
        />
      </div>
    </PhotoDragTransitionContext.Provider>
  );
}

export function usePhotoDragTransitionContext() {
  return useContext(PhotoDragTransitionContext);
}

const getMediaInCameraState = (): RectData => {
  const bottom = 41,
    height = 56,
    width = 56,
    y = window.innerHeight - bottom - height,
    x = 12;
  return {
    width,
    height,
    x,
    y,
    borderRadius: 8,
  };
};

const getMediaInGalleryState = (mediaDims: MediaDims): RectData => {
  const galleryStageHeight =
    window.innerHeight -
    (galleryTopBarHeight + galleryBottomBarHeight) * 16 * 0.25;

  const galleryStageAspectRatio = window.innerWidth / galleryStageHeight,
    mediaAspectRatio = mediaDims.width / mediaDims.height;

  const correctionFactor =
    mediaAspectRatio < galleryStageAspectRatio
      ? galleryStageHeight / mediaDims.height
      : window.innerWidth / mediaDims.width;

  const mediaHeight = mediaDims.height * correctionFactor;
  const mediaWidth = mediaDims.width * correctionFactor;

  const finalY =
    galleryTopBarHeight * 16 * 0.25 + (galleryStageHeight - mediaHeight) / 2;
  // console.log(
  //   `galleryTopBarHeight: ${galleryTopBarHeight}, galleryStageHeight: ${galleryStageHeight}, mediaHeight: ${mediaHeight}, mediaWidth: ${mediaWidth}, finalY: ${finalY}`
  // );

  return {
    x: 0,
    y: finalY,
    width: mediaWidth,
    height: mediaHeight,
    borderRadius: 0,
  };
};
