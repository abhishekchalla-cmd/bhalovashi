"use client";

import { alteDIN } from "@/fonts";
import { useState, useEffect, useRef, useMemo } from "react";

export type Item = { id: string; label: string };

interface IPhoneCameraModeCarouselProps {
  items: Item[];
  onSelect: (item: Item) => any;
  initialIndex?: number;
  overlayClassName?: string;
}

export default function IPhoneCameraModeCarousel({
  items,
  onSelect,
  initialIndex = 0,
  overlayClassName,
}: IPhoneCameraModeCarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const carouselItems = useRef<HTMLDivElement[]>([]);

  const [carouselXTranslate, setCarouselXTranslate] = useState(0);
  useEffect(() => {
    const elapsedWidth = carouselItems.current
      .filter((_, index) => index < selectedIndex)
      .reduce((acc, item) => acc + item.offsetWidth, 0);
    const currentItemWidth = carouselItems.current.length
      ? carouselItems.current[selectedIndex].offsetWidth
      : 0;

    const xResult =
      containerRef.current!.clientWidth / 2 -
      elapsedWidth -
      currentItemWidth / 2;

    if (isDragging) setCarouselXTranslate(xResult + currentX);
    else setCarouselXTranslate(xResult);
  }, [items, selectedIndex, isDragging, currentX]);

  const [carouselItemInCrossHairIndex, setCarouselItemInCrossHairIndex] =
    useState(0);
  useEffect(() => {
    if (isDragging) {
      const carouselElapsedWidth =
        containerRef.current!.clientWidth / 2 - carouselXTranslate;
      const result = carouselItems.current.reduce(
        (acc, cur, idx) => {
          const itemThreshold = cur.offsetWidth * 0.3 + acc.elapsedX;
          if (itemThreshold <= carouselElapsedWidth) {
            acc.index = idx;
          }
          acc.elapsedX += cur.offsetWidth;
          return acc;
        },
        {
          elapsedX: 0,
          index: 0,
        }
      );
      setCarouselItemInCrossHairIndex(result.index);
    } else {
      setCarouselItemInCrossHairIndex(selectedIndex);
    }
  }, [items, carouselXTranslate, isDragging, selectedIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setCurrentX(0);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touchX = e.targetTouches[0].clientX;
    const diff = touchX - touchStart;
    setCurrentX(diff);
  };

  const handleTouchEnd = () => {
    setSelectedIndex(carouselItemInCrossHairIndex);
    setIsDragging(false);
    setCurrentX(0);
  };

  useEffect(() => {
    onSelect(items[selectedIndex]);
  }, [selectedIndex, onSelect]);

  return (
    <div
      className={`relative w-full py-2 overflow-hidden`}
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`w-full flex ${isDragging ? "" : "transition-all duration-300"}`}
        style={{
          transform: `translateX(${carouselXTranslate}px)`,
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className={`${alteDIN.className} h-5 flex px-3 items-center justify-center uppercase text-center transition-all duration-300 cursor-pointer ${
              index ===
              (isDragging ? carouselItemInCrossHairIndex : selectedIndex)
                ? "text-yellow-300 font-medium"
                : "text-gray-400"
            }`}
            ref={(el) => {
              if (el) {
                carouselItems.current[index] = el;
              }
            }}
            onClick={() => setSelectedIndex(index)}
          >
            {item.label}
          </div>
        ))}
      </div>
      <div
        style={{
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(to right, #000, transparent, transparent, transparent, #000)",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "100%",
        }}
        className={overlayClassName}
      ></div>
    </div>
  );
}
