import IOSSlider from "@/components/IOSSlider";
import {
  IOSSLIDER_ITEM_STATE,
  IOSSliderItem,
  SliderItemId,
} from "@/components/IOSSlider/types";
import { useMemo, useState } from "react";

type ItemData = {
  name: string;
  age: number;
};

export default function IOSSliderTest() {
  const items = useMemo<IOSSliderItem<ItemData>[]>(() => {
    return [
      {
        id: 1,
        data: {
          name: "Abhishek Challa",
          age: 27,
        },
      },
      {
        id: 2,
        data: {
          name: "Arushi Bhal",
          age: 33,
        },
      },
      {
        id: 3,
        data: {
          name: "Manasvini Challa",
          age: 22,
        },
      },
      {
        id: 4,
        data: {
          name: "Pranjal Sharma",
          age: 27,
        },
      },
      {
        id: 5,
        data: {
          name: "Panya Gupta",
          age: 27,
        },
      },
    ];
  }, []);
  const [selectedItemId, setSelectedItemId] = useState<SliderItemId>(
    items[0].id
  );

  return (
    <div className="flex flex-col p-4">
      <div className="text-2xl font-semibold">IOS Slider Test</div>
      <div className="text-gray-400">
        <span className="font-semibold">Selected Item ID: </span>
        {selectedItemId}
      </div>
      <IOSSlider
        className="mt-10 h-20"
        items={items}
        defaultSelectedItemId={selectedItemId}
        renderItem={(item, state) => {
          const transitionTime = 0.1;
          const nameChunks = item.data.name.split(" ");
          const innerText =
            nameChunks[0][0].toUpperCase() + nameChunks[1][0].toUpperCase();
          if (
            state === IOSSLIDER_ITEM_STATE.NOT_SELECTED_AND_OUT_OF_CROSSHAIR ||
            state === IOSSLIDER_ITEM_STATE.SELECTED_AND_OUT_OF_CROSSHAIR
          ) {
            return (
              <div
                key={item.id}
                className="px-3 py-2 bg-gray-600 text-white rounded text-lg font-semibold"
                style={{ transition: transitionTime + "s" }}
              >
                {innerText}
              </div>
            );
          } else if (
            state === IOSSLIDER_ITEM_STATE.NOT_SELECTED_AND_IN_CROSSHAIR
          ) {
            return (
              <div
                key={item.id}
                className="px-3 py-2 bg-orange-500 text-black rounded text-lg font-semibold"
                style={{ transition: transitionTime + "s" }}
              >
                {innerText}
              </div>
            );
          } else {
            return (
              <div
                key={item.id}
                className="px-3 mx-2 py-2 bg-purple-700 text-white rounded text-lg font-semibold"
                style={{ transition: transitionTime + "s" }}
              >
                {innerText}
              </div>
            );
          }
        }}
      />
    </div>
  );
}
