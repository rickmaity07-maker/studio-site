"use client";

import { useRef } from "react";

/**
 * A card whose border and surface light up in mint under the cursor.
 * The pointer position is written straight to CSS variables, so moving
 * the mouse never re-renders React.
 */
export function Spotlight({
  children,
  className = "",
  as: Tag = "div"
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  const ref = useRef<HTMLElement>(null);

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      onPointerMove={onMove}
      className={`spotlight group/spot relative overflow-hidden rounded-2xl border border-line bg-surface ${className}`}
    >
      {children}
    </Tag>
  );
}
