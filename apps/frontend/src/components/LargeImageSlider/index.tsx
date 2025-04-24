import { NoSSRImage } from "@/utils/no-ssr-image";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import usePressEventHandlers from "../IOSSlider/event-handlers";
import { PhotoDragTransitionContext } from "@/contexts/PhotoDragTransitionContext";
import { CoordsInstant } from "@/utils/event";

export const LARGE_IMAGE_SLIDER_ITEM_TYPE = {
  IMAGE: "image",
  VIDEO: "video",
} as const;

export type LargeImageSliderItemType =
  (typeof LARGE_IMAGE_SLIDER_ITEM_TYPE)[keyof typeof LARGE_IMAGE_SLIDER_ITEM_TYPE];

export type LargeImageSliderItemId = string | number;

export type LargeImageSliderItem = {
  type: LargeImageSliderItemType;
  id: LargeImageSliderItemId;
  file: {
    src: string;
    height: number;
    width: number;
  };
  data?: any;
};

export type LargeImageSliderProps = {
  previousItem?: LargeImageSliderItem;
  currentItem: LargeImageSliderItem;
  nextItem?: LargeImageSliderItem;
  onChange: (item: LargeImageSliderItem) => any;
};

type DragState = {
  isDragging: boolean;
  initialTrayX?: number;
  initialCoords?: CoordsInstant;
  previousCoords?: CoordsInstant;
  currentCoords?: CoordsInstant;
  swipe?: {
    dir: number;
    timeout: NodeJS.Timeout;
  };
  holdX?: number;
};

const initialDragState: DragState = {
  isDragging: false,
};

export default function LargeImageSlider(props: LargeImageSliderProps) {
  const { previousItem, currentItem, nextItem, onChange } = props;
  const { initMediaTransition } = useContext(PhotoDragTransitionContext);

  const yThreshold = 40,
    xThreshold = 30,
    swipTransitionPeriodInMS = 300;

  const trayRef = useRef<HTMLDivElement | null>(null);
  const [dragState, setDragState] = useState<DragState>(initialDragState);

  const handleDragStart = useCallback(
    (clientX: number, clientY: number) => {
      const currentCoordInstant: CoordsInstant = {
        x: clientX,
        y: clientY,
        timeStamp: new Date().getTime(),
      };
      dragState.isDragging = true;
      dragState.initialTrayX = trayRef.current!.getBoundingClientRect().x;
      dragState.initialCoords = currentCoordInstant;
      dragState.previousCoords = currentCoordInstant;
      dragState.currentCoords = currentCoordInstant;
      dragState.holdX = undefined;
      if (dragState.swipe?.timeout) clearTimeout(dragState.swipe.timeout);
      setDragState({ ...dragState });
    },
    [dragState]
  );

  const handleDragMove = useCallback(
    (clientX: number, clientY: number, target: HTMLElement) => {
      const currentCoordInstant: CoordsInstant = {
        x: clientX,
        y: clientY,
        timeStamp: new Date().getTime(),
      };

      const xDiff = currentCoordInstant.x - dragState.initialCoords!.x,
        yDiff = currentCoordInstant.y - dragState.initialCoords!.y;
      if (yDiff > yThreshold) {
        // Image should close
        // const bcr = target.getBoundingClientRect();
        // initMediaTransition!(
        //   {
        //     id: currentItem.id,
        //     projectId: currentItem.data.projectId,
        //     url: currentItem.file.src,
        //     mediaDims: {
        //       height: currentItem.file.height,
        //       width: currentItem.file.width,
        //     },
        //   },
        //   -1,
        //   {
        //     x: bcr.x,
        //     y: bcr.y,
        //     height: bcr.height,
        //     width: bcr.width,
        //     borderRadius: 0,
        //   },
        //   true
        // );
      } else {
        if ((!previousItem && xDiff > 0) || (!nextItem && xDiff < 0)) {
        } else {
          Object.assign(dragState, {
            previousCoords: dragState.currentCoords,
            currentCoords: currentCoordInstant,
          });
        }
      }

      setDragState({ ...dragState });
    },
    [dragState, props]
  );

  const handleDragRelease = useCallback(() => {
    dragState.isDragging = false;

    const totalXDiff = dragState.currentCoords!.x - dragState.initialCoords!.x,
      lastFrameXDiff = dragState.currentCoords!.x - dragState.previousCoords!.x,
      dir =
        totalXDiff * lastFrameXDiff > xThreshold ? Math.sign(totalXDiff) : 0;

    const finalSwipeDir =
      (dragState.swipe?.dir && dragState.swipe.dir + dir === 0 ? 0 : dir) || 0;

    dragState.swipe = {
      dir: finalSwipeDir,
      timeout: setTimeout(() => {
        // Swipe is happening
        setDragState({ isDragging: false, holdX: finalSwipeDir || undefined });
        if (finalSwipeDir !== 0) {
          const newCurrentItem =
            finalSwipeDir === -1 ? nextItem! : previousItem!;
          onChange(newCurrentItem);
        }
      }, swipTransitionPeriodInMS),
    };

    setDragState({ ...dragState });
  }, [dragState, props]);

  const { touchStartHandler, mouseDownHandler } = usePressEventHandlers(
    {
      onPress: (e) => handleDragStart(e.clientX, e.clientY),
      onPressMove: (e) =>
        handleDragMove(e.clientX, e.clientY, e.target as HTMLImageElement),
      onRelease: () => handleDragRelease(),
    },
    [handleDragStart, handleDragMove, handleDragRelease]
  );

  useEffect(() => {
    dragState.holdX = undefined;
    setDragState({ ...dragState });
  }, [currentItem.id]);

  const swipeHappening = dragState.swipe && dragState.swipe.dir !== 0,
    holdHappening = !!dragState.holdX,
    x = dragState.isDragging
      ? dragState.initialTrayX! +
        dragState.currentCoords!.x -
        dragState.initialCoords!.x +
        "px"
      : swipeHappening
        ? dragState.swipe!.dir === 1
          ? "0%"
          : "-200%"
        : holdHappening
          ? dragState.holdX === 1
            ? "0%"
            : "-200%"
          : "-100%";

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div
        ref={trayRef}
        style={{
          width: "300%",
          position: "relative",
          height: "100%",
          transition: dragState.swipe
            ? swipTransitionPeriodInMS / 1000 + "s"
            : undefined,
          left: x,
        }}
        className="flex items-center"
        onTouchStart={dragState.holdX ? undefined : touchStartHandler}
        onMouseDown={dragState.holdX ? undefined : mouseDownHandler}
      >
        {[previousItem, currentItem, nextItem].map((item, idx) => {
          if (item) {
            return (
              <div
                className="relative w-1/3 h-full flex justify-center items-center"
                key={item.id}
              >
                {item.type === LARGE_IMAGE_SLIDER_ITEM_TYPE.IMAGE ? (
                  <NoSSRImage
                    src={item.file.src}
                    height={item.file.height}
                    width={item.file.width}
                    style={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      userSelect: "none",
                      transition: "0.2s",
                      transform:
                        dragState.isDragging || dragState.swipe
                          ? "scale(0.97)"
                          : undefined,
                    }}
                    draggable={false}
                    alt="Image"
                  />
                ) : null}
              </div>
            );
          } else {
            return (
              <div
                className="w-1/3 h-full flex justify-center items-center"
                key={idx}
              />
            );
          }
        })}
      </div>
    </div>
  );
}
