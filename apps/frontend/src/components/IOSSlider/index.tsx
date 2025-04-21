import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  IOSSLIDER_ITEM_STATE,
  IOSSliderProps,
  SLIDER_STATE,
  SliderStateData,
  TOUCH_EVENT_TYPE,
} from "./types";
import { handleMovementIntent } from "./event-handlers";

export default function IOSSlider<ID = any>(props: IOSSliderProps<ID>) {
  const {
    items,
    handleItemStateChange,
    defaultSelectedItemId,
    className,
    style,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const trayRef = useRef<HTMLDivElement | null>(null);

  const [{ data: sliderState }, setSliderState] = useState<{
    data: SliderStateData;
  }>({
    data: {
      state: SLIDER_STATE.STATIONARY,
      userXInstants: [],
      releaseXInstantsCalculator: (e) => e,
      releaseInstantTimestamp: 0,
      xTranslate: 0,

      consts: {},

      selectedItemId: defaultSelectedItemId,
      itemIdInCrosshair: defaultSelectedItemId,
    },
  });

  const windowTouchEventListeners = useRef<{
    [event: string]: ((e: TouchEvent) => any) | ((e: MouseEvent) => any);
  }>({});

  const touchStartHandler = useCallback((e: React.TouchEvent) => {
    /*


      Setting post touch start event handlers


      */
    windowTouchEventListeners.current.touchMove = (e: TouchEvent) =>
      handleMovementIntent(
        TOUCH_EVENT_TYPE.MOVED,
        e.targetTouches[0].clientX,
        sliderState.selectedItemId,
        { containerRef, trayRef },
        setSliderState
      );
    window.addEventListener(
      "touchmove",
      windowTouchEventListeners.current.touchMove
    );

    windowTouchEventListeners.current.touchEnd = (e: TouchEvent) => {
      window.removeEventListener(
        "touchmove",
        windowTouchEventListeners.current.touchMove as any
      );
      window.removeEventListener(
        "touchend",
        windowTouchEventListeners.current.touchEnd as any
      );

      delete windowTouchEventListeners.current.touchMove;
      delete windowTouchEventListeners.current.touchEnd;

      return handleMovementIntent(
        TOUCH_EVENT_TYPE.RELEASED,
        sliderState.userXInstants.slice(-1)[0].x,
        sliderState.selectedItemId,
        { containerRef, trayRef },
        setSliderState
      );
    };
    window.addEventListener(
      "touchend",
      windowTouchEventListeners.current.touchEnd
    );

    /*


      Handling touch start event
      

      */
    handleMovementIntent(
      TOUCH_EVENT_TYPE.PRESSED,
      e.targetTouches[0].clientX,
      sliderState.selectedItemId,
      { containerRef, trayRef },
      setSliderState
    );
  }, []);

  const mouseDownHandler = useCallback((e: React.MouseEvent) => {
    /*


      Setting post mouse down event handlers


      */
    windowTouchEventListeners.current.mouseMove = (e: MouseEvent) =>
      handleMovementIntent(
        TOUCH_EVENT_TYPE.MOVED,
        e.clientX,
        sliderState.selectedItemId,
        { containerRef, trayRef },
        setSliderState
      );
    window.addEventListener(
      "mousemove",
      windowTouchEventListeners.current.mouseMove
    );

    windowTouchEventListeners.current.mouseUp = (e: MouseEvent) => {
      window.removeEventListener(
        "mousemove",
        windowTouchEventListeners.current.mouseMove as any
      );
      window.removeEventListener(
        "mouseup",
        windowTouchEventListeners.current.mouseUp as any
      );

      delete windowTouchEventListeners.current.mouseMove;
      delete windowTouchEventListeners.current.mouseUp;

      return handleMovementIntent(
        TOUCH_EVENT_TYPE.RELEASED,
        e.clientX,
        sliderState.selectedItemId,
        { containerRef, trayRef },
        setSliderState
      );
    };
    window.addEventListener(
      "mouseup",
      windowTouchEventListeners.current.mouseUp
    );

    /*


      Handling mousedown event
      

      */
    handleMovementIntent(
      TOUCH_EVENT_TYPE.PRESSED,
      e.clientX,
      sliderState.selectedItemId,
      { containerRef, trayRef },
      setSliderState
    );
  }, []);

  return (
    <div
      className={`${className || ""}`}
      style={{ ...(style || {}), overflow: "hidden", userSelect: "none" }}
      ref={containerRef}
      onTouchStart={touchStartHandler}
      onMouseDown={mouseDownHandler}
    >
      <div
        ref={trayRef}
        style={{
          position: "relative",
          width: "max-content",
          display: "flex",
          alignItems: "center",
          left: sliderState.xTranslate + "px",
        }}
      >
        {items
          .concat(items.map((i) => ({ ...i, id: Number(i.id) + items.length })))
          .map((item) => (
            <div className="h-full float-left px-[2px]">
              {handleItemStateChange(
                item,
                item.id === defaultSelectedItemId
                  ? IOSSLIDER_ITEM_STATE.SELECTED_AND_IN_CROSSHAIR
                  : IOSSLIDER_ITEM_STATE.NOT_SELECTED_AND_OUT_OF_CROSSHAIR
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
