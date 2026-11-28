"use client";

import type { ReactNode } from "react";
import { CloudSun } from "lucide-react";
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
      className="relative"
      aria-label="City atmosphere and location selection"
    >
      {/* Decorative scenery behind the city controls */}
      <div
        className="atmosphere-scenery pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="atmosphere-landscape absolute">
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
        </div>

        {/* Fade the clouds behind the landmark to keep the silhouette legible. */}
        <div
          className="absolute inset-0 transition-[opacity,background-color] duration-700 ease-out motion-reduce:transition-none"
          style={{
            background: `radial-gradient(ellipse at 68% 78%, ${atmosphere.skyBottom} 0%, ${atmosphere.hazeColor} 45%, transparent 80%)`,
            opacity: 0.78,
          }}
        />
      </div>

      {/* Foreground city label and search controls */}
      <div className="relative z-10 mx-auto w-full max-w-[1380px] px-4 pt-3.5 pb-4 sm:px-6">
        <div className="mb-3 text-xs">
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
        </div>

        {children}
      </div>

    </section>
  );
}
