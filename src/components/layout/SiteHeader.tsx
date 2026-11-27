"use client";

import { useState } from "react";
import { Info, Menu, ShieldCheck, Wind } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AppViewTab } from "@/lib/air-quality-utils";
import type { City } from "@/lib/contracts";
import { cn } from "@/lib/utils";

const NAV_ITEMS: Array<{
  id: AppViewTab;
  label: string;
  description: string;
  icon: typeof Wind;
}> = [
  {
    id: "assistant",
    label: "Air quality & plan",
    description: "Outdoor readings and household action plan",
    icon: Wind,
  },
  {
    id: "about-data",
    label: "About the data",
    description: "Station measurements, regional estimates, and timestamps",
    icon: Info,
  },
  {
    id: "health-guide",
    label: "Health & safety guide",
    description: "Particle basics, home air care, and travel habits",
    icon: ShieldCheck,
  },
];

interface SiteHeaderProps {
  activeTab: AppViewTab;
  onTabChange: (tab: AppViewTab) => void;
  activeCity: City | null;
}

export function SiteHeader({ activeTab, onTabChange, activeCity }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function selectFromMobile(tab: AppViewTab) {
    onTabChange(tab);
    setMobileOpen(false);
  }

  return (
    <header className="glass-header border-b border-(--glass-border)/60">
      <div className="mx-auto flex w-full max-w-[1380px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="grid size-10 shrink-0 place-items-center rounded-lg border border-station-border bg-station-surface text-station dark:border-primary/45 dark:bg-primary/15 dark:text-primary"
            aria-hidden="true"
          >
            <Wind className="size-5" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                VayuSaathi
              </h1>
              <span className="hidden text-xs font-mono text-muted-foreground lg:inline">
                IST (UTC+05:30) · OpenAQ &amp; CAMS
              </span>
            </div>
            <p className="truncate text-xs text-muted-foreground sm:text-sm">
              Air quality readings and household guidance for Indian cities
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          {/* Single unified desktop navigation (Radix TabsList for keyboard Arrow/Home/End & ARIA) */}
          <nav className="hidden md:block" aria-label="Primary navigation">
            <TabsList variant="default" className="h-auto gap-1 glass-control border border-(--glass-border)/60 p-1">
              {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="min-h-10 gap-1.5 rounded-md px-3.5 text-sm font-medium text-muted-foreground data-active:border-primary/40 data-active:bg-primary/10 data-active:text-station dark:data-active:border-primary/40 dark:data-active:bg-primary/10 dark:data-active:text-station"
                >
                  <Icon className="size-4" strokeWidth={1.65} aria-hidden="true" />
                  <span>{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </nav>

          {/* Compact theme switcher accessible across desktop and mobile */}
          <ThemeSwitcher />

          {/* Compact mobile navigation drawer */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="glass-control size-11"
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" strokeWidth={1.75} aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass-chrome w-[300px] sm:w-[340px]">
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-2 text-base font-semibold">
                  <Wind className="size-4 text-station" aria-hidden="true" />
                  <span>VayuSaathi</span>
                </SheetTitle>
                <SheetDescription>
                  Air quality readings and daily household guidance.
                </SheetDescription>
              </SheetHeader>

              <Separator />

              <nav className="flex flex-col gap-2 px-4" aria-label="Mobile navigation">
                {NAV_ITEMS.map(({ id, label, description, icon: Icon }) => {
                  const isActive = activeTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => selectFromMobile(id)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex min-h-12 w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                        isActive
                          ? "border-station-border bg-primary/10 text-station dark:border-primary/40"
                          : "border-transparent bg-transparent text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="mt-0.5 size-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium leading-tight">{label}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>

              <Separator className="mt-auto" />

              <div className="space-y-1.5 px-4 pb-4 text-xs text-muted-foreground">
                <div className="font-medium text-foreground">
                  {activeCity
                    ? `Active city: ${activeCity.name}${activeCity.region ? `, ${activeCity.region}` : ""}`
                    : "No city selected"}
                </div>
                <div>All times shown in IST (UTC+05:30).</div>
              </div>
            </SheetContent>
          </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
