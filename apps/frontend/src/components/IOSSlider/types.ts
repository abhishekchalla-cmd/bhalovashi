export const SLIDER_STATE = {
  STATIONARY: "stationary",
  DRAGGING: "dragging",
  RELEASED: "released",
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

export type IOSSliderItem<ID> = {
  id: number | string;
  data: ID;
};

export type IOSSliderProps<ID> = {
  items: IOSSliderItem<ID>[];
  handleItemStateChange: (
    item: IOSSliderItem<ID>,
    state: ItemState
  ) => React.ReactNode;
  defaultSelectedItemId: number | string;
  className?: string;
  style?: any;
};

export type XInstant = { timeStamp: number; x: number };

export type SliderStateData = {
  state: SliderState;
  userXInstants: XInstant[];
  releaseInstantTimestamp: number;
  releaseXInstantsCalculator: (elapsedTime: number) => number;
  xTranslate: number;

  consts: {
    minX?: number;
    maxX?: number;
  };

  selectedItemId: number | string;
  itemIdInCrosshair: string | number;
};

export const TOUCH_EVENT_TYPE = {
  NONE: "none",
  PRESSED: "pressed",
  MOVED: "moved",
  RELEASED: "released",
} as const;

export type TouchEventType =
  (typeof TOUCH_EVENT_TYPE)[keyof typeof TOUCH_EVENT_TYPE];
