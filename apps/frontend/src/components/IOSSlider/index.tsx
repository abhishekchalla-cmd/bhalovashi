import React, { useCallback, useEffect, useReducer, useRef } from "react";
import {
  IOSSLIDER_ITEM_STATE,
  IOSSliderProps,
  SLIDER_ACTION,
  SLIDER_STATE,
} from "./types";
import sliderReducer, { sliderInitialState } from "./reducer";
import usePressEventHandlers from "./event-handlers";
import { getSliderItemId } from "./utils";

export default function IOSSlider<ID = any>(props: IOSSliderProps<ID>) {
  const {
    items,
    renderItem,
    onItemChange,
    defaultSelectedItemId,
    className,
    style,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const trayRef = useRef<HTMLDivElement | null>(null);
  const needsCenteringRef = useRef(false);

  /*
  
  
  
  Reducer setup
  
  
  
  */

  const [state, dispatch] = useReducer(sliderReducer, sliderInitialState);

  const stateOutsideClosure = useRef(state.state);

  // Add ResizeObserver for trayRef
  useEffect(() => {
    if (!trayRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      console.log("Needs centering");
      needsCenteringRef.current = true;
    });

    resizeObserver.observe(trayRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Handle centering when in STATIONED state
  useEffect(() => {
    if (state.state === SLIDER_STATE.STATIONED && needsCenteringRef.current) {
      needsCenteringRef.current = false;
      dispatch({
        type: SLIDER_ACTION.SELECT_ITEM,
        payload: {
          itemId: state.selectedItemId,
        },
      });
    }
  }, [state.state]);

  useEffect(() => {
    stateOutsideClosure.current = state.state;
    if (state.state === SLIDER_STATE.STARTING)
      dispatch({
        type: SLIDER_ACTION.LOAD,
        payload: {
          refs: { containerRef, trayRef },
        },
      });
    else if (state.state === SLIDER_STATE.STARTED)
      dispatch({
        type: SLIDER_ACTION.SELECT_ITEM,
        payload: {
          itemId: defaultSelectedItemId,
        },
      });
    else if (state.state === SLIDER_STATE.RELEASED) handleRelease();
    else if (state.state === SLIDER_STATE.ITEM_SELECTED) {
      const selectedItem = items.find((i) => i.id === state.selectedItemId);
      if (state.hasItemChanged && onItemChange) onItemChange(selectedItem!);
      handleItemCentering();
    }
  }, [state.state]);

  /*



  Per frame effects



  */

  const handleRelease = useCallback(() => {
    requestAnimationFrame(() => {
      if (stateOutsideClosure.current === SLIDER_STATE.RELEASED) {
        dispatch({
          type: SLIDER_ACTION.HANDLE_RELEASE__F,
          payload: {},
        });
        handleRelease();
      }
    });
  }, []);

  const handleItemCentering = useCallback(() => {
    requestAnimationFrame(() => {
      if (stateOutsideClosure.current === SLIDER_STATE.ITEM_SELECTED) {
        dispatch({
          type: SLIDER_ACTION.CENTER_ITEM__F,
          payload: {},
        });
        handleItemCentering();
      }
    });
  }, []);

  if (state.state === SLIDER_STATE.STATIONED) console.log("Stationed");

  /*



  Event handlers



  */

  const { touchStartHandler, mouseDownHandler } = usePressEventHandlers({
    onPress: (e) =>
      dispatch({
        type: SLIDER_ACTION.DRAG,
        payload: { clientX: e.clientX },
      }),
    onPressMove: (e) =>
      dispatch({
        type: SLIDER_ACTION.DRAG,
        payload: { clientX: e.clientX },
      }),
    onRelease: (e) => dispatch({ type: SLIDER_ACTION.RELEASE, payload: {} }),
  });

  return (
    <div
      className={`${className || ""}`}
      style={{ ...(style || {}), overflow: "hidden", userSelect: "none" }}
      ref={containerRef}
      onTouchStart={touchStartHandler}
      onMouseDown={mouseDownHandler}
    >
      <div
        style={{
          position: "absolute",
          left: "calc(50% - 1px)",
          height: "15px",
          width: "2px",
          background: "red",
        }}
      />
      <div
        ref={trayRef}
        style={{
          position: "relative",
          width: "max-content",
          display: "flex",
          alignItems: "center",
          left: state.xTranslate + "px",
          minHeight: "100%",
        }}
      >
        {items
          .concat(items.map((i) => ({ ...i, id: Number(i.id) + items.length })))
          .map((item) => {
            const itemState =
              item.id === state.selectedItemId &&
              item.id === state.itemIdInCrosshair
                ? IOSSLIDER_ITEM_STATE.SELECTED_AND_IN_CROSSHAIR
                : item.id === state.selectedItemId &&
                    item.id !== state.itemIdInCrosshair
                  ? IOSSLIDER_ITEM_STATE.SELECTED_AND_OUT_OF_CROSSHAIR
                  : item.id !== state.selectedItemId &&
                      item.id === state.itemIdInCrosshair
                    ? IOSSLIDER_ITEM_STATE.NOT_SELECTED_AND_IN_CROSSHAIR
                    : IOSSLIDER_ITEM_STATE.NOT_SELECTED_AND_OUT_OF_CROSSHAIR;

            return (
              <div
                id={getSliderItemId(item.id)}
                className="h-full float-left px-[2px]"
              >
                {renderItem(item, itemState)}
              </div>
            );
          })}
      </div>
    </div>
  );
}
