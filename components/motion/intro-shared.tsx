/**
 * Server-safe half of the first-visit intro (the client half is Intro.tsx).
 * Kept out of the "use client" module so the layout gets real values.
 */
export const INTRO_KEY = "rb-intro-seen";

/**
 * Runs in <head> before first paint: marks the first load of a session
 * with data-intro="play", so the server-rendered curtain is visible from
 * the very first frame instead of appearing after hydration.
 */
export const introScript = `try{if(!sessionStorage.getItem("${INTRO_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.dataset.intro="play"}}catch(e){}`;

/** The curtain itself. Pure CSS (globals.css), so it animates before React loads. */
export function IntroCurtain() {
  return (
    <div className="intro-curtain" aria-hidden>
      <div className="intro-mark">
        <span className="intro-diamond">◆</span>
        <span className="intro-word">
          <span>
            Rick<span className="text-muted">.build</span>
          </span>
        </span>
      </div>
      <span className="intro-line" />
    </div>
  );
}
