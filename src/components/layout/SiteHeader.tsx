"use client";

import { Info, ShieldCheck, Wind } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AppViewTab } from "@/lib/air-quality-utils";

const NAV_ITEMS: Array<{
  id: AppViewTab;
  label: string;
  icon: typeof Wind;
}> = [
  {
    id: "assistant",
    label: "Air quality & plan",
    icon: Wind,
  },
  {
    id: "about-data",
    label: "About the data",
    icon: Info,
  },
  {
    id: "health-guide",
    label: "Health & safety guide",
    icon: ShieldCheck,
  },
];

interface SiteHeaderProps {
  activeTab: AppViewTab;
}

export function SiteHeader({ activeTab }: SiteHeaderProps) {
  return (
    <header className="glass-header border-b border-(--glass-border)/60">
      <div className="mx-auto grid w-full max-w-[1380px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
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

        <nav className="col-span-2 row-start-2 min-w-0 lg:col-span-1 lg:col-start-2 lg:row-start-1" aria-label="Primary navigation">
          <TabsList className="header-nav-capsule" data-active-view={activeTab}>
            <span aria-hidden="true" className="header-nav-indicator" />
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <TabsTrigger key={id} value={id} className="header-nav-tab">
                <Icon className="size-4" strokeWidth={1.65} aria-hidden="true" />
                <span className="header-nav-label">{label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </nav>

        <div className="col-start-2 row-start-1 lg:col-start-3">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
