"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/components/motion/useReducedMotion";

// WebGL only runs in the browser; it loads after the page is visible.
const MeshGradient = dynamic(() => import("@paper-design/shaders-react").then((m) => m.MeshGradient), { ssr: false });

/**
 * The hero's living background: a slow mesh gradient in the brand colours,
 * rendered on the GPU. Reduced motion freezes the gradient on one frame.
 */
export function HeroBackdrop() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(false);
  // Fade in once mounted, so the canvas never pops in.
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      aria-hidden
      className={
        "pointer-events-none absolute inset-0 -z-10 transition-opacity duration-[2000ms] ease-[cubic-bezier(0.32,0.72,0,1)] " +
        (visible ? "opacity-100" : "opacity-0")
      }
      style={{
        // Fade the light out toward the bottom and the left, where the text sits.
        maskImage: "radial-gradient(120% 90% at 75% 30%, #000 30%, transparent 75%)",
        WebkitMaskImage: "radial-gradient(120% 90% at 75% 30%, #000 30%, transparent 75%)"
      }}
    >
      <MeshGradient
        className="h-full w-full"
        colors={["#07080B", "#0E4A3B", "#4CE8B0", "#132A3A", "#07080B"]}
        distortion={0.85}
        swirl={0.35}
        grainMixer={0.15}
        grainOverlay={0.08}
        speed={reduce ? 0 : 0.18}
        maxPixelCount={1920 * 1080}
        style={{ opacity: 0.55 }}
      />
    </div>
  );
}
