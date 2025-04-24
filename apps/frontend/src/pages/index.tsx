"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAppData } from "@/utils/app-data";

export default function Home() {
  const [isEntered, setIsEntered] = useState(false);
  const router = useRouter();
  const { projects } = useAppData();

  const animationDurationInMS = 300;

  useEffect(() => {
    if (isEntered) {
      setTimeout(
        () => router.push(`/project/${projects[0].id}`),
        animationDurationInMS
      );
    }
  }, [isEntered]);

  const [{ windowHeight, windowWidth }, setWindowDims] = useState({
    windowHeight: 0,
    windowWidth: 0,
  });
  useEffect(() => {
    setWindowDims({
      windowHeight: typeof window !== "undefined" ? window.innerHeight : 0,
      windowWidth: typeof window !== "undefined" ? window.innerWidth : 0,
    });
  }, []);

  const [buttonHeight, buttonWidth] = [40, 120];

  return (
    <div className="relative h-[calc(var(--vh,1vh)*100)] bg-black w-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="-translate-y-10 text-center">
        <span className="text-gray-400">Welcome to the world of</span>
        <div className="text-4xl font-bold mt-3">BHALOVASHI</div>
      </div>

      <button
        className={`flex items-center justify-center cursor-pointer rounded-full absolute font-bold text-blue-400`}
        style={{
          ...(isEntered
            ? {
                top:
                  (windowWidth > windowHeight
                    ? -((windowWidth - windowHeight) / 2)
                    : 0) + "px",
                left:
                  (windowHeight > windowWidth
                    ? -((windowHeight - windowWidth) / 2)
                    : 0) + "px",
                height: Math.max(windowHeight, windowWidth) + "px",
                width: Math.max(windowHeight, windowWidth) + "px",
                boxShadow: "0",
                background: "#000",
                color: "#000",
              }
            : {
                height: buttonHeight + "px",
                width: buttonWidth + "px",
                top: windowHeight
                  ? (windowHeight - buttonHeight) / 2 + 50 + "px"
                  : undefined,
                left: windowWidth
                  ? (windowWidth - buttonWidth) / 2 + "px"
                  : undefined,
                background: "#222",
              }),
          transition: animationDurationInMS / 1000 + "s",
          fontFamily: "inter, arial",
        }}
        onClick={() => setIsEntered(true)}
      >
        ENTER
      </button>
    </div>
  );
}
