"use client";

import Button from "@/components/button";
import { useAppContext } from "@/contexts/AppContext";
import Image from "next/image";
import IPhoneCameraTextCarousel from "@/components/IPhoneCameraTextCarousel";
import { useState } from "react";

export default function Home() {
  const { isEntered, setIsEntered } = useAppContext();
  const [selectedMode, setSelectedMode] = useState(0);

  const cameraModes = ["Photo", "Video", "Portrait", "Pano"];

  if (!isEntered) {
    return (
      <div className="h-screen w-screen bg-gradient-to-bl from-black to-gray-900 flex items-center justify-center">
        <Button className="w-34" onClick={() => setIsEntered(true)}>
          ENTER
        </Button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col">
      <div className="h-25 bg-black grid grid-cols-3 px-5">
        <div className="flex gap-x-2 justify-start mb-2">
          <Image
            src="/icons/lightning-icon.svg"
            alt="lightning"
            width={24}
            height={24}
          />
          <Image
            src="/icons/people-icon.svg"
            alt="lightning"
            width={24}
            height={24}
          />
        </div>
        <div className="flex gap-x-2 mb-2"></div>
        <div className="flex gap-x-2 justify-end mb-2">
          <Image
            src="/icons/lightning-icon.svg"
            alt="lightning"
            width={24}
            height={24}
          />
        </div>
      </div>

      <div
        style={{ height: "calc(100% - 18.75rem)" }}
        className="bg-gray-400"
      ></div>

      <div className="h-50 bg-black flex flex-col">
        <div className="flex gap-x-2 mb-2">
          <IPhoneCameraTextCarousel
            items={cameraModes}
            onSelect={setSelectedMode}
            initialIndex={0}
          />
        </div>
      </div>
    </div>
  );
}
