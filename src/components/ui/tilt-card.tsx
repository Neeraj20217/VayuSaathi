"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

export interface TiltCardProps extends React.ComponentProps<"div"> {
  /** Maximum tilt angle in degrees around X and Y axes. */
  maxTilt?: number;
  /** Scale factor on active hover. */
  hoverScale?: number;
  /** Maximum opacity of the cursor-following glare highlight (0..1). */
  glareOpacity?: number;
}

function getTiltCapabilitySnapshot(): string {
  if (typeof window === "undefined") return "0";
  try {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return finePointer && !reducedMotion ? "1" : "0";
  } catch {
    return "0";
  }
}

function getServerTiltSnapshot(): string {
  return "0";
}

function subscribeTiltCapability(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const pointerMedia = window.matchMedia("(hover: hover) and (pointer: fine)");
  const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
  pointerMedia.addEventListener("change", listener);
  motionMedia.addEventListener("change", listener);
  return () => {
    pointerMedia.removeEventListener("change", listener);
    motionMedia.removeEventListener("change", listener);
  };
}

/**
 * Interactive 3D tilt container inspired by the SmoothUI Tilt Card:
 * - Smooth damped rAF interpolation for rotateX, rotateY, and subtle hover scale.
 * - Restrained glare highlight restricted to fine-pointer desktop sessions without reduced motion.
 * - Zero content parallax so numbers and timestamps remain razor-sharp.
 */
export function TiltCard({
  children,
  className,
  maxTilt = 5,
  hoverScale = 1.01,
  glareOpacity = 0.13,
  onPointerMove,
  onPointerLeave,
  ...props
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);

  const stateRef = useRef({
    rx: 0,
    ry: 0,
    scale: 1,
    glare: 0,
    targetRx: 0,
    targetRy: 0,
    targetScale: 1,
    targetGlare: 0,
    gx: 50,
    gy: 50,
  });

  const enabled =
    useSyncExternalStore(subscribeTiltCapability, getTiltCapabilitySnapshot, getServerTiltSnapshot) ===
    "1";

  useEffect(() => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!enabled) {
      if (animRef.current) {
        window.cancelAnimationFrame(animRef.current);
        animRef.current = 0;
      }
      if (card) card.style.transform = "";
      if (glare) glare.style.opacity = "0";
    }
    return () => {
      if (animRef.current) {
        window.cancelAnimationFrame(animRef.current);
        animRef.current = 0;
      }
    };
  }, [enabled]);

  function startAnimationLoop() {
    if (animRef.current) return;
    let lastNow = performance.now();

    const step = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastNow) / 1000));
      lastNow = now;
      const s = stateRef.current;
      const ease = 1 - Math.exp(-18 * dt);

      s.rx += (s.targetRx - s.rx) * ease;
      s.ry += (s.targetRy - s.ry) * ease;
      s.scale += (s.targetScale - s.scale) * ease;
      s.glare += (s.targetGlare - s.glare) * ease;

      const settled =
        Math.abs(s.targetRx - s.rx) < 0.015 &&
        Math.abs(s.targetRy - s.ry) < 0.015 &&
        Math.abs(s.targetScale - s.scale) < 0.0004 &&
        Math.abs(s.targetGlare - s.glare) < 0.003;

      if (settled) {
        s.rx = s.targetRx;
        s.ry = s.targetRy;
        s.scale = s.targetScale;
        s.glare = s.targetGlare;
      }

      const card = cardRef.current;
      if (card) {
        if (s.rx === 0 && s.ry === 0 && s.scale === 1) {
          card.style.transform = "";
        } else {
          card.style.transform = `perspective(900px) rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg) scale3d(${s.scale.toFixed(4)}, ${s.scale.toFixed(4)}, 1)`;
        }
      }

      const glareEl = glareRef.current;
      if (glareEl) {
        glareEl.style.setProperty("--tilt-gx", `${s.gx.toFixed(1)}%`);
        glareEl.style.setProperty("--tilt-gy", `${s.gy.toFixed(1)}%`);
        glareEl.style.opacity = s.glare.toFixed(3);
      }

      if (settled) {
        animRef.current = 0;
      } else {
        animRef.current = window.requestAnimationFrame(step);
      }
    };

    animRef.current = window.requestAnimationFrame(step);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    if (!enabled || event.pointerType === "touch") return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const nx = Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width)));
    const ny = Math.max(0, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height)));

    const s = stateRef.current;
    s.targetRx = (0.5 - ny) * 2 * maxTilt;
    s.targetRy = (nx - 0.5) * 2 * maxTilt;
    s.targetScale = hoverScale;
    s.targetGlare = glareOpacity;
    s.gx = nx * 100;
    s.gy = ny * 100;

    startAnimationLoop();
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(event);
    const s = stateRef.current;
    s.targetRx = 0;
    s.targetRy = 0;
    s.targetScale = 1;
    s.targetGlare = 0;
    if (enabled) {
      startAnimationLoop();
    }
  }

  return (
    <div
      ref={cardRef}
      data-tilt-card="true"
      onPointerMove={enabled ? handlePointerMove : onPointerMove}
      onPointerLeave={enabled ? handlePointerLeave : onPointerLeave}
      className={cn("relative will-change-transform", className)}
      {...props}
    >
      {children}

      {/* Soft cursor-following glare highlight (hidden from assistive tech & disabled on touch) */}
      <div
        ref={glareRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] opacity-0"
        style={{
          background:
            "radial-gradient(240px circle at var(--tilt-gx, 50%) var(--tilt-gy, 50%), rgba(255, 255, 255, 0.92), transparent 72%)",
        }}
      />
    </div>
  );
}
