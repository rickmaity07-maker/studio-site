"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { INTRO_KEY as KEY } from "./intro-shared";

const MIN_MS = 1500;

/** True once the intro curtain is gone (or was skipped), so page entrances can start. */
const IntroContext = createContext(true);
export const useIntroDone = () => useContext(IntroContext);

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "play") {
      setDone(true);
      return;
    }
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    window.__lenis?.stop();

    // Lift once the brand moment has had its time AND the page is interactive.
    const wait = Math.max(0, MIN_MS - performance.now());
    const lift = setTimeout(() => {
      root.dataset.intro = "exit";
      setDone(true);
      window.__lenis?.start();
    }, wait);
    const cleanup = setTimeout(() => delete root.dataset.intro, wait + 1100);
    return () => {
      clearTimeout(lift);
      clearTimeout(cleanup);
    };
  }, []);

  return <IntroContext.Provider value={done}>{children}</IntroContext.Provider>;
}
