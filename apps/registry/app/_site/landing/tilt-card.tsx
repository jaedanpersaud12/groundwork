"use client";

import { useCallback, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * A card that leans toward the cursor and catches a light. Source: Spell UI
 * (spell.sh/docs/tilt-card), pulled through the `@spell` registry in `components.json` and
 * rewritten on top of `cn` and the contract instead of its own class list.
 *
 * The spotlight is the one deliberate exception to "no raw colours": it stands for light
 * hitting the surface, not for the surface itself, and a glint reads as a glint in either
 * theme only if it stays the same colour while everything under it inverts.
 */
export interface TiltCardProps {
  tiltLimit?: number;
  scale?: number;
  perspective?: number;
  effect?: "gravitate" | "evade";
  spotlight?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

function TiltCard({
  tiltLimit = 8,
  scale = 1.015,
  perspective = 1000,
  effect = "gravitate",
  spotlight = true,
  className,
  style,
  children,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(
    `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
  );
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const dir = effect === "evade" ? -1 : 1;

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const xRot = (py - 0.5) * (tiltLimit * 2) * dir;
      const yRot = (px - 0.5) * -(tiltLimit * 2) * dir;
      setTransform(`perspective(${perspective}px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale3d(${scale}, ${scale}, ${scale})`);
      if (spotlight) setSpotlightPos({ x: px * 100, y: py * 100 });
    },
    [tiltLimit, scale, perspective, dir, spotlight],
  );

  const handlePointerEnter = useCallback((event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    setIsHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setTransform(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
    setIsHovered(false);
  }, [perspective]);

  return (
    <div
      ref={cardRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn("relative isolate will-change-transform", className)}
      style={{ transform, transition: "transform 0.2s ease-out", transformStyle: "preserve-3d", ...style }}
    >
      {children}
      {spotlight ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
          style={{ opacity: isHovered ? 1 : 0, transition: "opacity 0.3s ease-out" }}
        >
          <div
            className="absolute size-[200%] rounded-full"
            style={{
              left: `${spotlightPos.x}%`,
              top: `${spotlightPos.y}%`,
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, rgb(255 255 255 / 16%) 0%, transparent 45%)",
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export { TiltCard };
