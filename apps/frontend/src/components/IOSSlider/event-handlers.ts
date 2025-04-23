import React, { useCallback, useRef } from "react";

type PressEventHandler = (e: {
  clientX: number;
  clientY: number;
  target: EventTarget | null;
}) => any;

type ReleaseEventHandler = (e: { target: EventTarget | null }) => any;

type UsePressEventHandlersProps = {
  onPress: PressEventHandler;
  onPressMove: PressEventHandler;
  onRelease: ReleaseEventHandler;
};

export default function usePressEventHandlers(
  { onPress, onPressMove, onRelease }: UsePressEventHandlersProps,
  deps: any[]
) {
  const windowTouchEventListeners = useRef<{
    [event: string]: ((e: TouchEvent) => any) | ((e: MouseEvent) => any);
  }>({});

  const touchStartHandler = useCallback((e: React.TouchEvent) => {
    /*


      Setting post touch start event handlers


      */
    windowTouchEventListeners.current.touchMove = (e: TouchEvent) =>
      onPressMove({
        clientX: e.targetTouches[0].clientX,
        clientY: e.targetTouches[0].clientY,
        target: e.target,
      });
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

      return onRelease({
        target: e.target,
      });
    };
    window.addEventListener(
      "touchend",
      windowTouchEventListeners.current.touchEnd
    );

    /*


      Handling touch start event
      

      */
    return onPress({
      clientX: e.targetTouches[0].clientX,
      clientY: e.targetTouches[0].clientY,
      target: e.target,
    });
  }, deps);

  const mouseDownHandler = useCallback((e: React.MouseEvent) => {
    /*


      Setting post mouse down event handlers


      */
    windowTouchEventListeners.current.mouseMove = (e: MouseEvent) =>
      onPressMove({
        clientX: e.clientX,
        clientY: e.clientY,
        target: e.target,
      });
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

      return onRelease({ target: e.target });
    };
    window.addEventListener(
      "mouseup",
      windowTouchEventListeners.current.mouseUp
    );

    /*


      Handling mousedown event
      

      */
    return onPress({
      clientX: e.clientX,
      clientY: e.clientY,
      target: e.target,
    });
  }, deps);

  return { touchStartHandler, mouseDownHandler };
}
