"use client";

import { createContext, useContext, type ReactNode } from "react";

const AnimationContext = createContext(true);

export function useAnimationEnabled() {
  return useContext(AnimationContext);
}

export function AnimationProvider({ children }: { children: ReactNode }) {
  return (
    <AnimationContext.Provider value={true}>
      {children}
    </AnimationContext.Provider>
  );
}
