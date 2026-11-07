import { useEffect, useRef } from "react";

type Handlers = {
  onApp: (index: number) => void;
  onHome: () => void;
  onPalette: () => void;
  /** Number and letter shortcuts pause while the palette is open, so typing works. */
  paused: boolean;
};

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

/** Keys pressed inside an app's iframe never reach the hub: browsers keep them in the frame.
 *  These shortcuts work on Home, and in an open app once focus is back on the rail. */
export function useShortcuts(handlers: Handlers) {
  const latest = useRef(handlers);
  latest.current = handlers;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const { onApp, onHome, onPalette, paused } = latest.current;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onPalette();
        return;
      }
      if (paused || event.ctrlKey || event.metaKey || event.altKey || isTyping(event.target)) return;

      if (event.key.toLowerCase() === "h") onHome();
      else if (/^[1-9]$/.test(event.key)) onApp(Number(event.key) - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
