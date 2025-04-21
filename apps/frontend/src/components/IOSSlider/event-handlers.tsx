import React from "react";
import {
  SLIDER_STATE,
  SliderStateData,
  TOUCH_EVENT_TYPE,
  TouchEventType,
  XInstant,
} from "./types";
import _ from "lodash";

type SliderStateSetter = React.Dispatch<
  React.SetStateAction<{ data: SliderStateData }>
>;

const userXInstantsMaxLength = 10;

type RefsCollection = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  trayRef: React.RefObject<HTMLDivElement | null>;
};

export const handleMovementIntent = (
  touchEventType: TouchEventType,
  userX: number,
  selectedItemId: number | string,
  refs: RefsCollection,
  setSliderStateData: SliderStateSetter
) => {
  /*
    - handles movement intents from user
    - handles item selection
  */
  setSliderStateData((ssd) => {
    initialiseConsts(ssd, refs);

    const { userXInstants } = ssd.data;
    if (touchEventType !== TOUCH_EVENT_TYPE.NONE) {
      /*
      
      
      Handling user drag movement intent


      */

      if (
        touchEventType === TOUCH_EVENT_TYPE.PRESSED ||
        touchEventType === TOUCH_EVENT_TYPE.MOVED
      ) {
        if (touchEventType === TOUCH_EVENT_TYPE.PRESSED) {
          // Cleaning userDrag history
          userXInstants.splice(0, userXInstants.length);
        }
        ssd.data.state = SLIDER_STATE.DRAGGING;

        userXInstants.push({
          x: userX,
          timeStamp: new Date().getTime(),
        });

        // Prune userInstants list
        if (userXInstants.length > userXInstantsMaxLength)
          userXInstants.splice(0, 1);

        if (userXInstants.length > 1) {
          const newXTranslate = getSanitizedXTranslate(
            ssd,
            ssd.data.xTranslate +
              (userXInstants[userXInstants.length - 1].x -
                userXInstants[userXInstants.length - 2].x)
          );

          ssd.data.xTranslate = newXTranslate;
        }
      } else {
        ssd.data.state = SLIDER_STATE.RELEASED;
        ssd.data.releaseXInstantsCalculator = createPositionCalculator(
          ssd.data.xTranslate,
          _.cloneDeep(userXInstants)
        );
        ssd.data.releaseInstantTimestamp = new Date().getTime();
        handleRelease(setSliderStateData, true);
      }

      /*


      Detecting item in crosshair


      */
    }

    return { ...ssd };
  });
};

const handleRelease = (
  setSliderStateData: SliderStateSetter,
  first: boolean = false
) => {
  requestAnimationFrame(() => {
    setSliderStateData((ssd) => {
      if (ssd.data.state === SLIDER_STATE.RELEASED) {
        const currentTimeStamp = new Date().getTime();

        const newX = getSanitizedXTranslate(
          ssd,
          ssd.data.releaseXInstantsCalculator(
            currentTimeStamp - ssd.data.releaseInstantTimestamp
          )
        );

        if (Math.round(newX) !== Math.round(ssd.data.xTranslate)) {
          // Setting xTranslate
          ssd.data.xTranslate = newX;
          handleRelease(setSliderStateData);

          return { ...ssd };
        } else {
          ssd.data.state = SLIDER_STATE.STATIONARY;
        }
      }

      ssd.data.releaseInstantTimestamp = 0;
      ssd.data.releaseXInstantsCalculator = (e) => e;
      return { ...ssd };
    });
  });
};

const getSanitizedXTranslate = (
  ssd: { data: SliderStateData },
  newXTranslate: number
) => {
  if (newXTranslate < ssd.data.consts.minX!) return ssd.data.consts.minX!;
  else if (newXTranslate > ssd.data.consts.maxX!) return ssd.data.consts.maxX!;
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

const initialiseConsts = (
  stateData: { data: SliderStateData },
  refs: RefsCollection
) => {
  if (!(stateData.data.consts.minX && stateData.data.consts.maxX)) {
    const container = refs.containerRef.current!,
      tray = refs.trayRef.current!;
    const minX = container.clientWidth / 2 - tray.clientWidth;
    const maxX = container.clientWidth / 2;

    console.log({ minX, maxX });

    stateData.data.consts.minX = minX;
    stateData.data.consts.maxX = maxX;
  }
};

function markMovement(x: number, styleOptions = {}) {
  const div = document.createElement("div");

  div.style.position = "absolute";
  div.style.left = x + "px";
  div.style.top = "200px";
  div.style.height = "5px";
  div.style.width = "5px";
  div.style.background = "red";
  Object.assign(div.style, styleOptions);

  document.body.appendChild(div);
}
