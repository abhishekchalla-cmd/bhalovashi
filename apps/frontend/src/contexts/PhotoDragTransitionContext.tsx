"use client";

import usePressEventHandlers, {
  PressEventHandler,
  ReleaseEventHandler,
} from "@/components/IOSSlider/event-handlers";
import { galleryBottomBarHeight, galleryTopBarHeight } from "@/config";
import { useAppData } from "@/utils/app-data";
import { CoordsInstant } from "@/utils/event";
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

export const PHOTO_DRAG_PAGE = {
  PROJECT: "project",
  GALLERY: "galley",
} as const;

export type PhotoDragPage =
  (typeof PHOTO_DRAG_PAGE)[keyof typeof PHOTO_DRAG_PAGE];

type PhotoDragTransitionContextType = {
  initMediaTransition?: (
    mediaFormat: MediaFormat,
    dir: number,
    initialRectData?: RectData,
    isDragging?: boolean
  ) => void;
  setHasTargetPageLoaded?: (page: PhotoDragPage) => void;
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
  targetPage?: PhotoDragPage;
};

export default function PhotoDragTransitionContextProvider(props: {
  children: React.ReactNode;
}) {
  const transitionEndTimeInMS = 250;
  const { children } = props;
  const router = useRouter();
  const { thumbnailDataURLs } = useAppData();

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
    setMediaTransitionState((v) => {
      const dir = v.dragState?.currentCoords
        ? Math.sign(v.dragState.initialCoords.y - v.dragState.currentCoords.y)
        : v.dir;

      const newState = {
        ...v,
        dir,
        currentRectState: v.dragState?.currentCoords
          ? {
              ...v.currentRectState!,
              x: v.dragState!.currentCoords.x,
              y: v.dragState!.currentCoords.y,
            }
          : v.currentRectState,
        finalRectState:
          dir === 1
            ? getMediaInGalleryState(v.mediaFormat!.mediaDims)
            : getMediaInCameraState(),
        isDragging: false,
      };
      return newState;
    });
  }, [mediaTransitionState]);

  const { attachPointerHandlers } = usePressEventHandlers(
    {
      onPress: () => {},
      onPressMove: handleDrag,
      onRelease: handleRelease,
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
        src: thumbnailDataURLs[media.id],
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
        attachPointerHandlers();
      }
    },
    [attachPointerHandlers]
  );

  useEffect(() => {
    const {
      isDragging,
      isTransitioning,
      finalRectState,
      mediaFormat: media,
      dir,
      isAnimating,
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

          handleAnimationEnd();
        }, transitionEndTimeInMS);
      }
    }
  }, [mediaTransitionState]);

  const handleAnimationEnd = useCallback(() => {
    setMediaTransitionState((v) => {
      if (
        v.hasTargetPageLoaded &&
        v.targetPage ===
          (v.dir === 1 ? PHOTO_DRAG_PAGE.GALLERY : PHOTO_DRAG_PAGE.PROJECT)
      ) {
        return {
          isTransitioning: false,
          isAnimating: false,
          isDragging: false,
        };
      } else {
        setTimeout(handleAnimationEnd, 50);
        return v;
      }
    });
  }, []);

  return (
    <PhotoDragTransitionContext.Provider
      value={{
        initMediaTransition,
        setHasTargetPageLoaded: (page) =>
          setMediaTransitionState((v) => ({
            ...v,
            hasTargetPageLoaded: true,
            targetPage: page,
          })),
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
            style={{ filter: "blur(10px)" }}
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
