"use client";

import React, { useId, useRef, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.ComponentProps<"div"> {
  /** Card density token matching shadcn/ui Card. */
  size?: "default" | "sm";
  /** Width in px of the sharper outer refractive rim (recommended >= 8px). */
  rimWidth?: number;
  /** Backdrop blur radius in px for the inset frosted body. */
  blur?: number;
  /** SVG displacement intensity on the Chromium refractive rim. Set 0 to disable displacement. */
  refraction?: number;
  /** Enable subtle specular reflection tracking fine pointers (respects reduced motion). */
  interactiveSpecular?: boolean;
}

function getCapabilitiesSnapshot(): string {
  if (typeof window === "undefined") return "0:0";
  let supportsDisplacement = false;
  try {
    supportsDisplacement =
      typeof CSS !== "undefined" &&
      typeof CSS.supports === "function" &&
      CSS.supports("backdrop-filter", "url(#glass-probe) blur(1px)");
  } catch {
    supportsDisplacement = false;
  }

  let allowPointerSpecular = false;
  try {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    allowPointerSpecular = finePointer && !reducedMotion;
  } catch {
    allowPointerSpecular = false;
  }

  return `${supportsDisplacement ? "1" : "0"}:${allowPointerSpecular ? "1" : "0"}`;
}

function getServerCapabilitiesSnapshot(): string {
  return "0:0";
}

function subscribeCapabilities(listener: () => void): () => void {
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
 * Translucent frosted-glass panel inspired by the SmoothUI Glass Card architecture:
 * - Inset frosted body separated from an outer refractive rim sampled against the raw backdrop.
 * - Restrained Chromium SVG displacement rim with automatic CSS backdrop-filter fallback.
 * - Neutral / sage bevel highlights and accessible reduced-motion / touch safeguards.
 */
export function GlassCard({
  children,
  className,
  size = "default",
  rimWidth = 8,
  blur = 14,
  refraction = 18,
  interactiveSpecular = true,
  onPointerMove,
  onPointerLeave,
  ...props
}: GlassCardProps) {
  const rawId = useId();
  const filterId = `vs-glass-rim-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const cardRef = useRef<HTMLDivElement>(null);
  const specularRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const caps = useSyncExternalStore(
    subscribeCapabilities,
    getCapabilitiesSnapshot,
    getServerCapabilitiesSnapshot
  );
  const [supportsDispFlag, allowSpecularFlag] = caps.split(":");
  const useDisplacementRim = supportsDispFlag === "1" && refraction > 0;
  const specularEnabled = interactiveSpecular && allowSpecularFlag === "1";

  const rimBlur = Math.max(1.2, Number((blur * 0.12).toFixed(1)));
  const rimBackdrop = useDisplacementRim
    ? `url(#${filterId}) blur(${rimBlur}px) saturate(var(--glass-backdrop-saturate, 1.35)) brightness(var(--glass-backdrop-brightness, 1))`
    : `blur(${Math.max(2, Math.round(blur * 0.2))}px) saturate(var(--glass-backdrop-saturate, 1.28)) brightness(var(--glass-backdrop-brightness, 1))`;
  const bodyBackdrop = `blur(${blur}px) saturate(var(--glass-backdrop-saturate, 1.32)) brightness(var(--glass-backdrop-brightness, 1))`;

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    if (!specularEnabled || !cardRef.current || !specularRef.current) return;
    if (event.pointerType === "touch") return;

    const clientX = event.clientX;
    const clientY = event.clientY;
    if (rafRef.current) return;

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = 0;
      const el = cardRef.current;
      const spec = specularRef.current;
      if (!el || !spec) return;
      const rect = el.getBoundingClientRect();
      const xPct = (((clientX - rect.left) / Math.max(1, rect.width)) * 100).toFixed(1);
      const yPct = (((clientY - rect.top) / Math.max(1, rect.height)) * 100).toFixed(1);
      spec.style.setProperty("--glass-px", `${xPct}%`);
      spec.style.setProperty("--glass-py", `${yPct}%`);
      spec.style.opacity = "1";
    });
  }

  function handlePointerLeave(event: React.PointerEvent<HTMLDivElement>) {
    onPointerLeave?.(event);
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (specularRef.current) {
      specularRef.current.style.opacity = "0";
    }
  }

  return (
    <div
      ref={cardRef}
      data-slot="card"
      data-glass="true"
      data-size={size}
      onPointerMove={specularEnabled ? handlePointerMove : onPointerMove}
      onPointerLeave={specularEnabled ? handlePointerLeave : onPointerLeave}
      className={cn(
        "group/card relative overflow-hidden rounded-xl border border-(--glass-border) text-sm text-card-foreground shadow-(--glass-shadow) [--card-spacing:--spacing(6)] data-[size=sm]:[--card-spacing:--spacing(4)]",
        className
      )}
      {...props}
    >
      {/* Offscreen static SVG turbulence/displacement definition for Chromium refractive rim */}
      {useDisplacementRim && (
        <svg
          aria-hidden="true"
          focusable="false"
          className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        >
          <defs>
            <filter
              id={filterId}
              x="-4%"
              y="-4%"
              width="108%"
              height="108%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.016"
                numOctaves="2"
                seed="5"
                result="noise"
              />
              <feGaussianBlur in="noise" stdDeviation="2" result="softNoise" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="softNoise"
                scale={refraction}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}

      {/* Inset frosted body so the outer rim samples the unblurred sky backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute z-0"
        style={{
          inset: `${rimWidth}px`,
          borderRadius: `calc(0.75rem - ${rimWidth}px)`,
          backgroundColor: "var(--glass-bg)",
          WebkitBackdropFilter: bodyBackdrop,
          backdropFilter: bodyBackdrop,
        }}
      />

      {/* Crisp 8px outer refractive rim clipped with mask-composite */}
      <div
        aria-hidden="true"
        className="glass-rim-mask pointer-events-none absolute inset-0 z-[1] rounded-[inherit]"
        style={{
          padding: `${rimWidth}px`,
          backgroundColor: "var(--glass-rim-bg)",
          WebkitBackdropFilter: rimBackdrop,
          backdropFilter: rimBackdrop,
        }}
      />

      {/* Restrained silver/sage bezel rim ring + top specular bevel & subtle depth shade */}
      <div
        aria-hidden="true"
        className="glass-rim-mask pointer-events-none absolute inset-0 z-[2] rounded-[inherit]"
        style={{
          padding: "1px",
          background:
            "linear-gradient(155deg, var(--glass-rim-highlight) 0%, var(--glass-rim-secondary) 52%, var(--glass-border) 100%)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2] rounded-[inherit]"
        style={{
          background:
            "linear-gradient(180deg, var(--glass-top-highlight) 0%, transparent 36%, var(--glass-depth-shade) 100%)",
        }}
      />

      {/* Pointer-tracking specular reflection (disabled automatically on touch / reduced motion) */}
      {specularEnabled && (
        <div
          ref={specularRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[3] rounded-[inherit] opacity-0 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(360px circle at var(--glass-px, 50%) var(--glass-py, 0%), var(--glass-specular-spot), transparent 68%)",
          }}
        />
      )}

      {/* Interactive foreground card content */}
      <div className="relative z-10 flex flex-col">
        {children}
      </div>
    </div>
  );
}
