import _ from "lodash";
import {
  SLIDER_ACTION,
  SLIDER_STATE,
  SliderActionObject,
  SliderItemId,
  SliderStateData,
  XInstant,
} from "./types";
import { getIdFromSliderItemId, getSliderItemId } from "./utils";

export const sliderInitialState: SliderStateData = {
  state: SLIDER_STATE.STARTING,
  consts: {},

  // Caruosel x translate
  xTranslate: 0,
  lastXTranslate: null,

  // Drag variables
  userXInstants: [],
  releaseInstantTimestamp: 0,
  releaseXInstantsCalculator: (elapsedTime) => elapsedTime,

  // Item selection
  selectedItemId: -1,
  hasItemChanged: false,
};

export default function sliderReducer(
  state: SliderStateData,
  { payload, type }: SliderActionObject
) {
  switch (type) {
    case SLIDER_ACTION.LOAD:
      const container = payload.refs.containerRef.current!,
        tray = payload.refs.trayRef.current!;

      state.consts.refs = payload.refs;

      const minX = container.clientWidth / 2 - tray.clientWidth;
      const maxX = container.clientWidth / 2;

      state.consts.minX = minX;
      state.consts.maxX = maxX;
      state.consts.crossHairX =
        container.getBoundingClientRect().x + container.clientWidth / 2;

      state.state = SLIDER_STATE.STARTED;
      break;

    case SLIDER_ACTION.SELECT_ITEM:
      state.hasItemChanged = state.selectedItemId !== payload.itemId;
      selectItem(state, payload.itemId);
      break;

    case SLIDER_ACTION.DRAG:
      state.state = SLIDER_STATE.DRAGGING;
      const uxi = state.userXInstants;
      uxi.push({
        x: payload.clientX,
        timeStamp: new Date().getTime(),
      });
      const xDiff =
        uxi.length > 1 ? uxi[uxi.length - 1].x - uxi[uxi.length - 2].x : 0;
      const newXTranslate = getSanitizedXTranslate(
        state,
        state.xTranslate + xDiff
      );
      if (newXTranslate !== state.xTranslate)
        state.lastXTranslate = state.xTranslate; // Need this to maintain last scrolling direction
      state.xTranslate = newXTranslate;
      break;

    case SLIDER_ACTION.RELEASE:
      state.state = SLIDER_STATE.RELEASED;
      state.releaseInstantTimestamp = new Date().getTime();
      state.releaseXInstantsCalculator = createPositionCalculator(
        state.xTranslate,
        _.cloneDeep(state.userXInstants)
      );
      break;

    case SLIDER_ACTION.HANDLE_RELEASE__F:
      handleReleaseFrame(state);
      break;

    case SLIDER_ACTION.CENTER_ITEM__F:
      handleItemCenteringFrame(state);
      break;

    case SLIDER_ACTION.RESET:
      return _.cloneDeep(sliderInitialState);
  }

  if (state.state !== SLIDER_STATE.STARTING) determineItemInCrosshair(state);

  return { ...state };
}

const determineItemInCrosshair = (state: SliderStateData) => {
  const tray = state.consts.refs!.trayRef.current!,
    chX = state.consts.crossHairX!;

  if (state.itemIdInCrosshair === undefined) {
    for (const si of Array.from(tray.childNodes) as HTMLDivElement[]) {
      const siStart = si.getBoundingClientRect().x,
        siEnd = siStart + si.clientWidth;
      if (siStart <= chX && siEnd >= chX) {
        state.itemIdInCrosshair = getIdFromSliderItemId(si.id);
      }
    }
  }

  if (state.itemIdInCrosshair === undefined) return;

  const dir = Math.sign(
    state.xTranslate - (state.lastXTranslate || state.xTranslate)
  );
  const oldDivInCrossHair = document.getElementById(
    getSliderItemId(state.itemIdInCrosshair)
  ) as HTMLDivElement;
  const divInCrossHair = searchDivInCrossHair(chX, oldDivInCrossHair, dir);
  const itemIdInCrosshair = getIdFromSliderItemId(divInCrossHair.id);
  state.itemIdInCrosshair = itemIdInCrosshair;
};

const handleReleaseFrame = (state: SliderStateData) => {
  const currentTimeStamp = new Date().getTime();

  const newX = getSanitizedXTranslate(
    state,
    state.releaseXInstantsCalculator(
      currentTimeStamp - state.releaseInstantTimestamp
    )
  );

  if (Math.round(newX) !== Math.round(state.xTranslate)) {
    // Setting xTranslate
    state.lastXTranslate = state.xTranslate;
    state.xTranslate = newX;
  } else {
    // Release finished
    determineItemInCrosshair(state);
    selectItem(state, state.itemIdInCrosshair!);

    state.releaseXInstantsCalculator = (e) => e;
    state.releaseInstantTimestamp = 0;
    state.userXInstants.splice(0, state.userXInstants.length);
  }
};

const initialiseCenteringParams = (state: SliderStateData) => {
  const targetItem = document.getElementById(
      getSliderItemId(state.selectedItemId)
    )!,
    currentX = state.xTranslate,
    desiredX =
      currentX -
      (targetItem.getBoundingClientRect().x -
        (state.consts.crossHairX! - targetItem.clientWidth / 2));

  state.centeringParams = {
    itemSelectionTimeStamp: new Date().getTime(),
    initialX: state.xTranslate,
    desiredX,
    shiftDir: Math.sign(desiredX - currentX),
    a: (desiredX - currentX) * 20,
    c: 2,
  };
};

const selectItem = (state: SliderStateData, itemId: SliderItemId) => {
  state.selectedItemId = itemId;
  state.state = SLIDER_STATE.ITEM_SELECTED;
  initialiseCenteringParams(state);
};

const handleItemCenteringFrame = (state: SliderStateData) => {
  // const { a, c, desiredX, itemSelectionTimeStamp, shiftDir, initialX } =
  //   state.centeringParams!;
  // const currentTimeStamp = new Date().getTime();
  // const elapsedTime = currentTimeStamp - itemSelectionTimeStamp;

  // const x = (t: number) =>
  //   a * Math.log(Math.pow(t / 1000, 2) + 1) - c * (t / 1000);

  // const newX = initialX + x(elapsedTime);

  // // Set X
  // if (
  //   // Approaching left
  //   (shiftDir === -1 && newX >= desiredX) ||
  //   // Approaching right
  //   (shiftDir === 1 && newX <= desiredX)
  // ) {
  //   if (state.xTranslate !== newX) state.lastXTranslate = state.xTranslate;
  //   state.xTranslate = newX;
  // } else {
  //   // Centering finished
  //   state.xTranslate = desiredX;
  //   state.state = SLIDER_STATE.STATIONED;
  // }
  if (state.selectedItemId) {
    const targetItem = document.getElementById(
      getSliderItemId(state.selectedItemId)
    ) as HTMLDivElement;
    const tiCurrentX = targetItem.getBoundingClientRect().x,
      desiredX = state.consts.crossHairX! - targetItem.clientWidth / 2 - 5,
      shiftRequired = desiredX - tiCurrentX;
    state.xTranslate += shiftRequired;
  }
  state.state = SLIDER_STATE.STATIONED;
};

/*



UTILS



*/

const getSanitizedXTranslate = (
  state: SliderStateData,
  newXTranslate: number
) => {
  if (newXTranslate < state.consts.minX!) return state.consts.minX!;
  else if (newXTranslate > state.consts.maxX!) return state.consts.maxX!;
  else return newXTranslate;
};

function createPositionCalculator(
  initialPosition: number,
  positionData: XInstant[],
  { decelerationRate = 0.8, positionSampleSize = 3 } = {}
) {
  if (positionData.length < positionSampleSize + 1)
    return (et: number) => initialPosition;

  const velocitySample = positionData
    .slice(-positionSampleSize)
    .map((pos, idx) => {
      const positionFromPD =
        positionData[positionData.length - positionSampleSize + idx - 1];
      return (
        (pos.x - positionFromPD.x) /
        ((pos.timeStamp - positionFromPD.timeStamp) / 100)
      );
    });
  const initialVelocity = Math.max(...velocitySample.map((e) => e * 3));

  return (elapsedTime: number) => {
    if (elapsedTime === 0) return initialPosition;

    const postReleaseDistance =
      initialVelocity *
      (1 - Math.pow(Math.E, -decelerationRate * (elapsedTime / 100)));

    return initialPosition + postReleaseDistance;
  };
}

const searchDivInCrossHair = (
  chX: number,
  maybeDivInCrossHair: HTMLDivElement,
  dir: number
) => {
  const start = maybeDivInCrossHair.getBoundingClientRect().x,
    end = start + maybeDivInCrossHair.clientWidth;
  if (start <= chX && end >= chX) return maybeDivInCrossHair;
  else {
    const nextMayDivInCrosshair =
      dir === 1
        ? maybeDivInCrossHair.previousSibling
        : dir === -1
          ? maybeDivInCrossHair.nextSibling
          : null;
    if (!nextMayDivInCrosshair) return maybeDivInCrossHair;

    return searchDivInCrossHair(
      chX,
      nextMayDivInCrosshair as HTMLDivElement,
      dir
    );
  }
};
