import { useEffect, useRef, type CSSProperties } from "react";

const CELL = 64;

/** A white grid that stays invisible except around the cursor, plus a fill on the cell under it. */
export function CursorGrid() {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = layer.current;
    if (!element) return;

    const pointer = { x: 0, y: 0 };
    let frame = 0;

    const draw = () => {
      frame = 0;
      element.style.setProperty("--x", `${pointer.x}px`);
      element.style.setProperty("--y", `${pointer.y}px`);
      element.style.setProperty("--cell-x", `${Math.floor(pointer.x / CELL) * CELL}px`);
      element.style.setProperty("--cell-y", `${Math.floor(pointer.y / CELL) * CELL}px`);
    };
    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      element.dataset.active = "true";
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const onLeave = () => {
      delete element.dataset.active;
    };

    const root = document.documentElement;
    window.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={layer} aria-hidden className="cursor-grid" style={{ "--cell": `${CELL}px` } as CSSProperties}>
      <div className="cursor-grid-cell" />
      <div className="cursor-grid-lines" />
    </div>
  );
}
