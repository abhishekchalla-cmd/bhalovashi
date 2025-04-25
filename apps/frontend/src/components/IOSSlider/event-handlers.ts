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
    [event: string]: ((e: PointerEvent) => any) | ((e: MouseEvent) => any);
  }>({});

  /*




  Event attachers




  */
  const removePointerHandlers = useCallback(() => {
    const attachingContainer = attachingContainerRef?.current || window;

    attachingContainer.removeEventListener(
      "pointermove",
      windowTouchEventListeners.current.touchMove as any
    );
    attachingContainer.removeEventListener(
      "pointerup",
      windowTouchEventListeners.current.touchEnd as any
    );

    delete windowTouchEventListeners.current.touchMove;
    delete windowTouchEventListeners.current.touchEnd;
  }, []);

  const attachPointerHandlers = useCallback(() => {
    const attachingContainer = attachingContainerRef?.current || window;

    /*


      Setting post touch start event handlers


      */
    windowTouchEventListeners.current.touchMove = (e: PointerEvent) => {
      onPressMove({
        clientX: e.clientX,
        clientY: e.clientY,
        target: e.target,
      });
    };
    attachingContainer.addEventListener(
      "pointermove",
      windowTouchEventListeners.current.touchMove as EventListener
    );

    windowTouchEventListeners.current.touchEnd = (e: PointerEvent) => {
      removePointerHandlers();

      return onRelease({
        target: e.target,
      });
    };
    attachingContainer.addEventListener(
      "pointerup",
      windowTouchEventListeners.current.touchEnd as EventListener
    );
  }, deps);

  const pointerDownHandler = useCallback((e: React.PointerEvent) => {
    attachPointerHandlers();

    return onPress({
      clientX: e.clientX,
      clientY: e.clientY,
      target: e.target,
    });
  }, deps);

  /*




  Helpers




  */

  useEffect(() => {
    return () => {
      removePointerHandlers();
    };
  }, []);

  return { pointerDownHandler, attachPointerHandlers };
}
