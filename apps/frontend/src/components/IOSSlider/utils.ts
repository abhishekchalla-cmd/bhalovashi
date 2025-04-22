import { SliderItemId } from "./types";

export const getSliderItemId = (id: SliderItemId) => `slider-item-${id}`;
export const getIdFromSliderItemId = (siid: string) =>
  Number(siid.split("-").slice(-1)[0]);
