"use client";

import type { ReactNode } from "react";
import { CloudSun, Info } from "lucide-react";
import { CitySkylineSvg } from "@/components/atmosphere/CitySkylines";
import type { AtmosphereState } from "@/lib/atmosphere";
import type { City } from "@/lib/contracts";
import { cn } from "@/lib/utils";

interface AtmosphericBackgroundProps {
  city: City | null;
  atmosphere: AtmosphereState;
  children?: ReactNode;
}

export function AtmosphericBackground({
  city,
  atmosphere,
  children,
}: AtmosphericBackgroundProps) {
  return (
    <section
      className="relative overflow-hidden border-b border-border/80 shadow-[0_1px_2px_rgba(25,55,44,0.04)]"
      aria-label="City atmosphere and location selection"
    >
      {/* City-specific architectural skyline layer anchored cleanly along the bottom horizon */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[136px] sm:h-[168px]"
        aria-hidden="true"
      >
        <CitySkylineSvg
          skyline={atmosphere.skyline}
          farColor={atmosphere.skylineColorFar}
          midColor={atmosphere.skylineColorMid}
          accentColor={atmosphere.skylineColorAccent}
          cutoutColor={atmosphere.skylineCutoutColor}
          farOpacity={atmosphere.farLayerOpacity}
          landmarkOpacity={atmosphere.landmarkOpacity}
          contrast={atmosphere.skylineContrast}
        />

        {/* Subtle atmospheric horizon depth anchored strictly at the bottom of the skyline */}
        <div
          className="absolute inset-0 transition-[opacity,background-color] duration-700 ease-out motion-reduce:transition-none"
          style={{
            background: `linear-gradient(180deg, transparent 0%, transparent 40%, ${atmosphere.hazeColor} 92%, ${atmosphere.skyBottom} 100%)`,
            opacity: atmosphere.hazeOpacity,
          }}
        />
      </div>

      {/* Foreground interactive search workspace + concise scientific disclosure */}
      <div className="relative z-10 mx-auto w-full max-w-[1380px] px-4 pt-3.5 pb-4 sm:px-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="glass-chrome inline-flex items-center gap-1.5 rounded-md border border-(--glass-border) px-2.5 py-1 font-medium text-foreground shadow-2xs">
            <CloudSun
              className={cn(
                "size-3.5 shrink-0",
                atmosphere.basis === "model" ? "text-model" : "text-primary"
              )}
              aria-hidden="true"
            />
            <span>
              {city ? `${city.name} · ${atmosphere.landmarkLabel}` : atmosphere.landmarkLabel}
            </span>
          </div>

          <p className="glass-chrome inline-flex items-center gap-1.5 rounded-md border border-(--glass-border) px-2.5 py-1 text-[11px] leading-snug text-muted-foreground shadow-2xs">
            <Info className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span>{atmosphere.disclosure}</span>
          </p>
        </div>

        {children}
      </div>
    </section>
  );
}
