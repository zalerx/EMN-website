"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";

const AnimationContext = createContext(true);

export function useAnimationEnabled() {
  return useContext(AnimationContext);
}

export function AnimationProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  return (
    <AnimationContext.Provider value={enabled}>
      {children}
      <button
        onClick={() => setEnabled((prev) => !prev)}
        aria-label={enabled ? "Pause animations" : "Play animations"}
        className="fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full border-2 border-emn-black bg-white shadow-lg transition-colors hover:bg-emn-offwhite"
      >
        {enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
    </AnimationContext.Provider>
  );
}
