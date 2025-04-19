"use client";

import { useRouter } from "next/router";
import Button from "@/components/button";
import { useAppContext } from "@/contexts/AppContext";
import { useEffect, useState } from "react";
import { appInitContext } from "@/init";

export default function Home() {
  const { isEntered, enter } = useAppContext();

  const animationDurationInMS = 300;

  const router = useRouter();

  useEffect(() => {
    appInitContext.getProjects().then((projects) => {
      if (isEntered) {
        setTimeout(
          () => router.replace(`/project/${projects[0].id}`),
          animationDurationInMS
        );
      }
    });
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
    <div className="h-[calc(var(--vh,1vh)*100)] bg-gray-900 w-screen flex items-center justify-center">
      <div
        className={`flex items-center justify-center cursor-pointer rounded-lg bg-gradient-to-bl from-black to-gray-900 absolute`}
        style={{
          ...(isEntered
            ? {
                top: "0px",
                left: "0px",
                height: windowHeight + "px",
                width: windowWidth + "px",
                boxShadow: "0",
                background: "#000",
                color: "#000",
              }
            : {
                height: buttonHeight + "px",
                width: buttonWidth + "px",
                top: windowHeight
                  ? (windowHeight - buttonHeight) / 2 + "px"
                  : undefined,
                left: windowWidth
                  ? (windowWidth - buttonWidth) / 2 + "px"
                  : undefined,
              }),
          transition: animationDurationInMS / 1000 + "s",
        }}
        onClick={enter}
      >
        ENTER
      </div>
    </div>
  );
}
