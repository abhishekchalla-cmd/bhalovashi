"use client";

import Button from "@/components/button";
import { useAppContext } from "@/contexts/AppContext";
import Image from "next/image";
import IPhoneCameraTextCarousel from "@/components/IPhoneCameraTextCarousel";
import { useState } from "react";

export default function Home() {
  const { isEntered, enter } = useAppContext();
  const [selectedMode, setSelectedMode] = useState(0);

  const cameraModes = ["Photo", "Video", "Portrait", "Pano"];

  if (!isEntered) {
    return (
      <div className="h-[calc(var(--vh,1vh)*100)] w-screen bg-gradient-to-bl from-black to-gray-900 flex items-center justify-center">
        <Button className="w-34" onClick={enter}>
          ENTER
        </Button>
      </div>
    );
  }

  const topBarHeight = 20;
  const bottomBarHeight = 40;

  return (
    <div className="w-screen h-[calc(var(--vh,1vh)*100)] flex flex-col">
      <div className={`h-${topBarHeight} bg-black`}>
        <div className="grid grid-cols-3 px-5 h-full max-w-[600px] mx-auto">
          <div className="flex gap-x-3 justify-start mb-2">
            <Image
              src="/icons/lightning-icon.svg"
              alt="lightning"
              width={30}
              height={30}
            />
            <Image
              src="/icons/people-icon.svg"
              alt="lightning"
              width={30}
              height={30}
            />
          </div>
          <div className="flex gap-x-2 mb-2"></div>
          <div className="flex gap-x-2 justify-end mb-2">
            <Image
              src="/icons/depth.svg"
              alt="lightning"
              width={30}
              height={30}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          height: `calc(100% - (0.25 * (${topBarHeight}rem + ${bottomBarHeight}rem))`,
        }}
        className="bg-gray-400"
      ></div>

      <div className={`h-${bottomBarHeight} bg-black`}>
        <div className="flex flex-col items-center">
          <IPhoneCameraTextCarousel
            items={cameraModes}
            onSelect={setSelectedMode}
            initialIndex={0}
            overlayClassName="w-full max-w-[600px] mx-auto"
          />

          <div className="w-full grid grid-cols-3 gap-x-2 mt-4 px-3 items-center max-w-[600px]">
            <div>
              <div className="w-14 h-14 bg-gray-400 rounded-lg"></div>
            </div>
            <div className="flex justify-center">
              <Image
                src="/icons/capture.svg"
                alt="flash"
                width={70}
                height={70}
              />
            </div>
            <div className="flex justify-end">
              <Image
                src="/icons/front-cam.svg"
                alt="flash"
                width={50}
                height={50}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
