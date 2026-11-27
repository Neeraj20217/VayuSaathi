"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useRef } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

const THEMES: Array<{
  value: ThemePreference;
  label: string;
  description: string;
  Icon: typeof Sun;
}> = [
  { value: "light",  label: "Light",  description: "Light theme (Forest & Sage)",  Icon: Sun     },
  { value: "dark",   label: "Dark",   description: "Dark theme (Midnight Charcoal)", Icon: Moon   },
  { value: "system", label: "System", description: "Match device theme",            Icon: Monitor },
];

export function ThemeSwitcher() {
  const { theme, mounted, setTheme } = useTheme();
  const activeTheme: ThemePreference = mounted ? theme : "light";
  const activeIndex = THEMES.findIndex((t) => t.value === activeTheme);
  const groupRef = useRef<HTMLDivElement>(null);

  /* Keyboard: ArrowLeft / ArrowRight cycle through options */
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = (activeIndex + dir + THEMES.length) % THEMES.length;
    setTheme(THEMES[next].value);
    // Move focus to the newly active button
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>("[role='radio']");
    buttons?.[next]?.focus();
  }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Color theme"
      onKeyDown={handleKeyDown}
      className="theme-switcher-capsule"
    >
      {/* Sliding glass puck */}
      <span
        aria-hidden="true"
        className="theme-switcher-puck"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />

      {THEMES.map(({ value, label, description, Icon }, i) => {
        const isSelected = activeIndex === i;
        return (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${label} theme`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setTheme(value)}
                data-theme-option={value}
                className={cn(
                  "theme-switcher-btn",
                  isSelected ? "theme-switcher-btn--active" : "theme-switcher-btn--idle"
                )}
              >
                <Icon className="size-[15px]" strokeWidth={isSelected ? 2 : 1.6} aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8} className="text-xs">
              {description}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
