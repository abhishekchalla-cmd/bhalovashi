import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useReducer,
  useRef,
} from "react";
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
    onItemInCrosshair,
    defaultSelectedItemId,
    className,
    style,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const trayRef = useRef<HTMLDivElement | null>(null);

  /*
  
  
  
  Reducer setup
  
  
  
  */

  const [state, dispatch] = useReducer(sliderReducer, sliderInitialState);

  const stateOutsideClosure = useRef(state.state);

  useEffect(() => {
    stateOutsideClosure.current = state.state;
    if (
      state.state === SLIDER_STATE.STARTING ||
      !state.consts.refs?.trayRef.current ||
      !state.consts.refs?.containerRef.current
    ) {
      dispatch({
        type: SLIDER_ACTION.LOAD,
        payload: {
          refs: { containerRef, trayRef },
        },
      });
    } else if (state.state === SLIDER_STATE.STARTED)
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

  useEffect(() => {
    if (state.itemIdInCrosshair !== undefined && onItemInCrosshair) {
      const itemInCrosshair = items.find(
        (i) => i.id === state.itemIdInCrosshair
      )!;
      onItemInCrosshair(itemInCrosshair);
    }
  }, [state.itemIdInCrosshair]);

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

  /*



  Event handlers



  */

  const { touchStartHandler, mouseDownHandler } = usePressEventHandlers(
    {
      onPress: (e) => {},
      onPressMove: (e) =>
        dispatch({
          type: SLIDER_ACTION.DRAG,
          payload: { clientX: e.clientX },
        }),
      onRelease: (e) => dispatch({ type: SLIDER_ACTION.RELEASE, payload: {} }),
      name: "IOSSlider",
    },
    []
  );

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
          left: state.xTranslate + "px",
          height: "100%",
        }}
      >
        {items.map((item) => {
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
              key={item.id}
              onClick={() =>
                dispatch({
                  type: SLIDER_ACTION.SELECT_ITEM,
                  payload: { itemId: item.id },
                })
              }
            >
              {renderItem(
                item,
                itemState,
                state.state === SLIDER_STATE.DRAGGING
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
