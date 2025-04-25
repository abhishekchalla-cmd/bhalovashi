import { isTouchDevice } from "@/utils/device";
import React, { useCallback, useEffect, useRef } from "react";

export type PressEventHandler = (e: {
  clientX: number;
  clientY: number;
  target: EventTarget | null;
}) => any;

export type ReleaseEventHandler = (e: { target: EventTarget | null }) => any;

type UsePressEventHandlersProps = {
  onPress: PressEventHandler;
  onPressMove: PressEventHandler;
  onRelease: ReleaseEventHandler;
  attachingContainerRef?: React.RefObject<HTMLDivElement | null>;
  name?: string;
};

export default function usePressEventHandlers(
  {
    onPress,
    onPressMove,
    onRelease,
    attachingContainerRef,
    name,
  }: UsePressEventHandlersProps,
  deps: any[]
) {
  const windowTouchEventListeners = useRef<{
    [event: string]: ((e: TouchEvent) => any) | ((e: MouseEvent) => any);
  }>({});

  /*




  Event attachers




  */
  const removeTouchHandlers = useCallback(() => {
    const attachingContainer = attachingContainerRef?.current || window;

    attachingContainer.removeEventListener(
      "touchmove",
      windowTouchEventListeners.current.touchMove as any
    );
    attachingContainer.removeEventListener(
      "touchend",
      windowTouchEventListeners.current.touchEnd as any
    );

    delete windowTouchEventListeners.current.touchMove;
    delete windowTouchEventListeners.current.touchEnd;
  }, []);

  const attachTouchHandlers = useCallback(() => {
    const attachingContainer = attachingContainerRef?.current || window;

    /*


      Setting post touch start event handlers


      */
    windowTouchEventListeners.current.touchMove = (e: TouchEvent) => {
      onPressMove({
        clientX: e.targetTouches[0].clientX,
        clientY: e.targetTouches[0].clientY,
        target: e.target,
      });
    };
    attachingContainer.addEventListener(
      "touchmove",
      windowTouchEventListeners.current.touchMove as EventListener
    );

    windowTouchEventListeners.current.touchEnd = (e: TouchEvent) => {
      removeTouchHandlers();

      return onRelease({
        target: e.target,
      });
    };
    attachingContainer.addEventListener(
      "touchend",
      windowTouchEventListeners.current.touchEnd as EventListener
    );
  }, deps);

  const removeMouseHandlers = useCallback(() => {
    const attachingContainer = attachingContainerRef?.current || window;

    attachingContainer.removeEventListener(
      "mousemove",
      windowTouchEventListeners.current.mouseMove as any
    );
    attachingContainer.removeEventListener(
      "mouseup",
      windowTouchEventListeners.current.mouseUp as any
    );

    delete windowTouchEventListeners.current.mouseMove;
    delete windowTouchEventListeners.current.mouseUp;
  }, []);

  const attachMouseHandlers = useCallback(() => {
    const attachingContainer = attachingContainerRef?.current || window;

    /*


      Setting post mouse down event handlers


      */
    windowTouchEventListeners.current.mouseMove = (e: MouseEvent) =>
      onPressMove({
        clientX: e.clientX,
        clientY: e.clientY,
        target: e.target,
      });
    attachingContainer.addEventListener(
      "mousemove",
      windowTouchEventListeners.current.mouseMove as EventListener
    );

    windowTouchEventListeners.current.mouseUp = (e: MouseEvent) => {
      onRelease({ target: e.target });
      removeMouseHandlers();
    };

    attachingContainer.addEventListener(
      "mouseup",
      windowTouchEventListeners.current.mouseUp as EventListener
    );
  }, deps);

  /*




  Press handlers




  */

  const touchStartHandler = useCallback((e: React.TouchEvent) => {
    attachTouchHandlers();

    return onPress({
      clientX: e.targetTouches[0].clientX,
      clientY: e.targetTouches[0].clientY,
      target: e.target,
    });
  }, deps);

  const mouseDownHandler = useCallback((e: React.MouseEvent) => {
    attachMouseHandlers();

    return onPress({
      clientX: e.clientX,
      clientY: e.clientY,
      target: e.target,
    });
  }, deps);

  /*




  Helpers




  */

  const attachPressHandlers = useCallback(() => {
    if (isTouchDevice()) attachTouchHandlers();
    else attachMouseHandlers();
  }, [attachTouchHandlers, attachMouseHandlers]);

  useEffect(() => {
    return () => {
      if (isTouchDevice()) removeTouchHandlers();
      else removeMouseHandlers();
    };
  }, []);

  return { touchStartHandler, mouseDownHandler, attachPressHandlers };
}
