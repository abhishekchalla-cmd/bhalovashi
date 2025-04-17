"use client";

import React, { createContext, useContext, useState } from "react";

type AppContextType = {
  isEntered: boolean;
  setIsEntered: (isEntered: boolean) => void;
};

export const AppContext = createContext<AppContextType>({
  isEntered: false,
  setIsEntered: () => {},
});

export default function AppContextProvider(props: {
  children: React.ReactNode;
}) {
  const { children } = props;
  const [isEntered, setIsEntered] = useState(false);

  return (
    <AppContext.Provider value={{ isEntered, setIsEntered }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
