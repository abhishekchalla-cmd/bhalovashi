"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type AppContextType = {};

export const AppContext = createContext<AppContextType>({});

export default function AppContextProvider(props: {
  children: React.ReactNode;
}) {
  const { children } = props;

  useEffect(() => {
    // Function to update the viewport height
    const updateViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    // Initial update
    updateViewportHeight();

    // Add event listeners
    window.addEventListener("resize", updateViewportHeight);
    window.addEventListener("orientationchange", updateViewportHeight);

    // Cleanup
    return () => {
      window.removeEventListener("resize", updateViewportHeight);
      window.removeEventListener("orientationchange", updateViewportHeight);
    };
  }, []);

  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
