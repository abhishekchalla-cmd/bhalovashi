import React from "react";

type IconGroupProps = {
  padding: number;
  iconHeight: number;
  children: React.ReactNode;
};

export default function IconGroup({
  padding,
  iconHeight,
  children,
}: IconGroupProps) {
  return (
    <div
      style={{
        padding: `${padding}px ${padding}px`,
        borderRadius: padding + iconHeight + "px",
      }}
      className="bg-gray-800 w-max"
    >
      {children}
    </div>
  );
}
