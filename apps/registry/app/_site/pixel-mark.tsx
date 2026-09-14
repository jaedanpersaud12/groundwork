import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

import { MARK_PATH, MARK_VIEWBOX } from "./mark";

/*
 * The G at display size, laid pixel by pixel. The mark is already pixel art — a 24 x 26 grid
 * of 13.5467-unit cells — so the grid is read back out of the mark's own outline rather than
 * drawn a second time: change the path and this changes with it.
 *
 * The entrance builds from the bottom row up, the way groundwork is laid. Each cell rises a
 * fraction of itself, grows from 60%, and lands tinted with the signal colour before settling
 * into the mark's own. A little per-cell jitter, seeded from the cell's position so the server
 * and the browser agree, keeps the rows from reading as a wipe. Once the last cell lands, the
 * real outline fades in over the grid, so the mark at rest is the logo itself rather than 309
 * squares whose shared edges can show hairline seams.
 *
 * Pure CSS, so it runs with scripting off. The hidden starting state exists only under
 * `prefers-reduced-motion: no-preference` (the site's rule — see apps/registry/AGENTS.md):
 * under `reduce` the keyframes are never declared and the mark is simply there.
 */

const CELL = 13.5467;
/**
 * How far a cell reaches into a filled neighbour to its right or below. While a cell animates
 * the browser rasterises it on its own and blends its edge pixels, so two cells that merely
 * touch leave a hairline where two half-covered pixels meet. Overlapping by a few units (a
 * couple of pixels at display size) puts a solid pixel under every blended one. A cell only
 * bleeds toward another cell, never past the outline: it reaches into the corner between its
 * two tabs only when the diagonal cell is filled too, since at a staircase step that corner
 * is outside the mark.
 */
const BLEED = 3;

type Point = [number, number];

/** The outline's corners. The path is only absolute M, H, V and Z, which is all pixel art needs. */
function outline(d: string): Point[] {
  const points: Point[] = [];
  let x = 0;
  let y = 0;
  for (const [, command, args] of d.matchAll(/([MHVZ])([^MHVZ]*)/g)) {
    const values = args.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (command === "M") [x, y] = values;
    else if (command === "H") x = values[0];
    else if (command === "V") y = values[0];
    else continue;
    points.push([x, y]);
  }
  return points;
}

function inside([px, py]: Point, polygon: Point[]): boolean {
  let hit = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** A stable 0–1 value per cell, identical on the server and in the browser. */
function jitter(col: number, row: number): number {
  const h = Math.imul(col * 73856093 ^ row * 19349663, 2654435761) >>> 0;
  return (h % 1000) / 1000;
}

const [, , WIDTH, HEIGHT] = MARK_VIEWBOX.split(" ").map(Number);
const COLS = Math.round(WIDTH / CELL);
const ROWS = Math.round(HEIGHT / CELL);

const n = (value: number) => Math.round(value * 1000) / 1000;

/**
 * One cell as a path: its square, a tab into the neighbour on the right and one into the
 * neighbour below, and the corner between the tabs only when the diagonal cell is filled.
 */
function cellPath(x: number, y: number, right: boolean, down: boolean, diagonal: boolean): string {
  const notch = right && down && !diagonal ? `H${n(x + CELL)}` : "";
  return `M${n(x)} ${n(y)}H${n(x + CELL + (right ? BLEED : 0))}V${n(y + CELL)}${notch}V${n(y + CELL + (down ? BLEED : 0))}H${n(x)}Z`;
}

/** Every filled cell, its shape with bleed, and its entrance delay. Computed once per module load. */
const CELLS = (() => {
  const polygon = outline(MARK_PATH);
  const filled = (col: number, row: number) => inside([(col + 0.5) * CELL, (row + 0.5) * CELL], polygon);
  const cells: { key: string; d: string; delay: number }[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (!filled(col, row)) continue;
      const fromBottom = (ROWS - 1 - row) / (ROWS - 1);
      cells.push({
        key: `${col},${row}`,
        d: cellPath(col * CELL, row * CELL, filled(col + 1, row), filled(col, row + 1), filled(col + 1, row + 1)),
        delay: Math.round(fromBottom * 900 + jitter(col, row) * 220),
      });
    }
  }
  return cells;
})();

const DURATION = 700;
/** When the last cell has settled: the solid outline takes over from here. */
const SETTLED = Math.max(...CELLS.map((cell) => cell.delay)) + DURATION;

const STYLE = `
@media (prefers-reduced-motion: no-preference) {
  .pixel-mark [data-cell] {
    transform-box: fill-box;
    transform-origin: center;
    animation: pixel-mark-in ${DURATION}ms var(--ease-fluid) both;
    animation-delay: calc(var(--pixel-delay) + var(--pixel-start, 0ms));
  }
  .pixel-mark [data-outline] {
    animation: pixel-mark-settle 240ms linear both;
    animation-delay: calc(${SETTLED}ms + var(--pixel-start, 0ms));
  }
}
@keyframes pixel-mark-settle {
  from { opacity: 0; }
}
@keyframes pixel-mark-in {
  0% { opacity: 0; transform: translateY(40%) scale(0.6); fill: var(--primary); }
  30% { opacity: 1; }
  45% { transform: none; fill: var(--primary); }
  100% { opacity: 1; transform: none; fill: currentColor; }
}
`;

/**
 * `start` holds the whole entrance back, for when something else on the page arrives first.
 * Size it with a height or width class; the other side follows the mark's proportions.
 */
function PixelMark({ className, start = 0 }: { className?: string; start?: number }) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden
      focusable="false"
      className={cn("pixel-mark", className)}
      style={{ "--pixel-start": `${start}ms` } as CSSProperties}
    >
      <style>{STYLE}</style>
      {CELLS.map((cell) => (
        <path
          key={cell.key}
          data-cell=""
          d={cell.d}
          style={{ "--pixel-delay": `${cell.delay}ms` } as CSSProperties}
        />
      ))}
      <path data-outline="" d={MARK_PATH} />
    </svg>
  );
}

export { PixelMark };
