import React from "react";

export const SLIDER_STATE = {
  STARTING: "starting",
  STARTED: "started",
  STATIONED: "stationed",
  DRAGGING: "dragging",
  RELEASED: "released",
  ITEM_SELECTED: "item_selected",
} as const;

export type SliderState = (typeof SLIDER_STATE)[keyof typeof SLIDER_STATE];

export const IOSSLIDER_ITEM_STATE = {
  SELECTED_AND_OUT_OF_CROSSHAIR: "selected-and-out-of-crosshair",
  SELECTED_AND_IN_CROSSHAIR: "selected-and-in-crosshair",
  NOT_SELECTED_AND_OUT_OF_CROSSHAIR: "not-selected-and-out-of-crosshair",
  NOT_SELECTED_AND_IN_CROSSHAIR: "not-selected-and-in-crosshair",
} as const;

export type ItemState =
  (typeof IOSSLIDER_ITEM_STATE)[keyof typeof IOSSLIDER_ITEM_STATE];

export type SliderItemId = number | string;

export type IOSSliderItem<ID> = {
  id: SliderItemId;
  data: ID;
};

export type IOSSliderProps<ID> = {
  items: IOSSliderItem<ID>[];
  renderItem: (
    item: IOSSliderItem<ID>,
    state: ItemState,
    isDragging: boolean
  ) => React.ReactNode;
  defaultSelectedItemId: SliderItemId;
  className?: string;
  style?: any;
  onItemInCrosshair?: (item: IOSSliderItem<ID>) => any;
  onItemChange?: (item: IOSSliderItem<ID>) => any;
};

export type XInstant = { timeStamp: number; x: number };

export type SliderStateData = {
  state: SliderState;
  userXInstants: XInstant[];
  releaseInstantTimestamp: number;
  releaseXInstantsCalculator: (elapsedTime: number) => number;
  xTranslate: number;
  lastXTranslate: number | null;

  consts: {
    minX?: number;
    maxX?: number;
    refs?: RefsCollection;
    crossHairX?: number;
  };

  selectedItemId: SliderItemId;
  hasItemChanged: boolean;
  itemIdInCrosshair?: string | number;
  centeringParams?: {
    shiftDir: number;
    itemSelectionTimeStamp: number;
    initialX: number;
    desiredX: number;
    a: number;
    c: number;
  };
};

export const TOUCH_EVENT_TYPE = {
  NONE: "none",
  PRESSED: "pressed",
  MOVED: "moved",
  RELEASED: "released",
} as const;

export type TouchEventType =
  (typeof TOUCH_EVENT_TYPE)[keyof typeof TOUCH_EVENT_TYPE];

type RefsCollection = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  trayRef: React.RefObject<HTMLDivElement | null>;
};

export const SLIDER_ACTION = {
  LOAD: "load",
  DRAG: "drag",
  RELEASE: "release",
  HANDLE_RELEASE__F: "handle_release_frame",
  SELECT_ITEM: "select_item",
  CENTER_ITEM__F: "center_item_frame",
  RESET: "reset",
} as const;

export type SliderActionType =
  (typeof SLIDER_ACTION)[keyof typeof SLIDER_ACTION];

export type SliderActionObject =
  | {
      type: typeof SLIDER_ACTION.LOAD;
      payload: {
        refs: RefsCollection;
      };
    }
  | {
      type: typeof SLIDER_ACTION.DRAG;
      payload: {
        clientX: number;
      };
    }
  | {
      type: typeof SLIDER_ACTION.RELEASE;
      payload: {};
    }
  | {
      type: typeof SLIDER_ACTION.HANDLE_RELEASE__F;
      payload: {};
    }
  | {
      type: typeof SLIDER_ACTION.SELECT_ITEM;
      payload: {
        itemId: SliderItemId;
      };
    }
  | {
      type: typeof SLIDER_ACTION.CENTER_ITEM__F;
      payload: {};
    }
  | {
      type: typeof SLIDER_ACTION.RESET;
      payload: {};
    };
