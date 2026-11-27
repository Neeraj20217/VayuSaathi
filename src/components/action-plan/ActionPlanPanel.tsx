"use client";

import {
  Activity,
  AlertTriangle,
  Bus,
  CheckCircle2,
  House,
  Info,
  RotateCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ACTION_BENEFIT_SUMMARY,
  getRelevantCircumstances,
  PLAN_BASIS_COPY,
} from "@/lib/air-quality-utils";
import type { City, Plan, Profile } from "@/lib/contracts";
import { cn } from "@/lib/utils";

interface ActionPlanPanelProps {
  city: City | null;
  profile: Profile;
  plan: Plan | null;
  generating: boolean;
  planError: string;
  canRetry: boolean;
  onRetry: () => void;
}

const PREVIEW_CATEGORIES = [
  {
    title: "Daily routine",
    subtitle: "Outdoor timing",
    icon: Activity,
    description: "Adjusts outdoor play, breaks, or routes around recent local readings.",
  },
  {
    title: "Indoor air",
    subtitle: "Home air care",
    icon: House,
    description:
      "Focuses on kitchen exhaust, reducing indoor smoke, and spaces used by children or older adults.",
  },
  {
    title: "Travel & commute",
    subtitle: "Everyday trips",
    icon: Bus,
    description: "Matches your usual travel mode with practical ways to combine or share trips.",
  },
] as const;

export function ActionPlanPanel({
  city,
  profile,
  plan,
  generating,
  planError,
  canRetry,
  onRetry,
}: ActionPlanPanelProps) {
  if (generating) {
    return (
      <GlassCard
        role="status"
        aria-live="polite"
      >
        <CardHeader className="border-b border-border/80 bg-muted/40 px-5 py-4">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            Creating your household action plan{city ? ` for ${city.name}` : ""}…
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Choosing daily routine, home air, and travel steps tailored to your household and
            recent local readings.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="space-y-3 rounded-lg border border-border/80 bg-(--glass-subcard-bg) p-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-5 w-36" />
            </div>
          ))}
        </CardContent>
      </GlassCard>
    );
  }

  if (planError) {
    return (
      <GlassCard className="border-danger-border">
        <CardHeader className="border-b border-danger-border bg-danger-surface/65 px-5 py-4">
          <CardTitle className="text-lg font-semibold text-destructive">
            Action plan unavailable
          </CardTitle>
          <CardDescription className="text-sm text-destructive/90">
            The recommendation request could not be completed right now.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <Alert
            variant="destructive"
            className="border-danger-border bg-danger-surface text-destructive"
          >
            <AlertTriangle className="size-4" aria-hidden="true" />
            <AlertTitle>Could not create your action plan</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>{planError}</p>
              {canRetry && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onRetry}
                  className="min-h-11 border-danger-border bg-card text-destructive hover:bg-danger-surface"
                >
                  <RotateCw className="size-4" aria-hidden="true" />
                  <span>Retry action plan</span>
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </GlassCard>
    );
  }

  if (!plan) {
    return (
      <GlassCard>
        <CardHeader className="border-b border-border/80 bg-muted/35 px-5 py-4">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            Personalized household action plan
          </CardTitle>
          <CardDescription className="mt-1 text-sm text-muted-foreground">
            Select your household members and preferences, then click Generate action plan to get
            steps for daily routine, indoor air, and travel.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-3">
          {PREVIEW_CATEGORIES.map(({ title, subtitle, icon: Icon, description }) => (
            <div
              key={title}
              className="flex flex-col gap-2 rounded-lg border border-dashed border-sage/75 bg-(--glass-subcard-bg) p-4"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Icon className="size-4 text-station" strokeWidth={1.75} aria-hidden="true" />
                <span>{title}</span>
              </div>
              <div className="text-xs font-medium text-muted-foreground">{subtitle}</div>
              <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </CardContent>
      </GlassCard>
    );
  }

  const fromGemini = plan.source === "gemini";
  const isFallback = plan.source === "fallback";
  const isLimited = plan.basis === "limited";

  const cards = [
    {
      type: "routine" as const,
      category: "Daily routine",
      focusLabel: "Outdoor timing",
      icon: Activity,
      action: plan.actions.routine,
    },
    {
      type: "indoor" as const,
      category: "Indoor air",
      focusLabel: "Home environment",
      icon: House,
      action: plan.actions.indoor,
    },
    {
      type: "travel" as const,
      category: "Travel and commute",
      focusLabel: "Everyday trips",
      icon: Bus,
      action: plan.actions.travel,
    },
  ];

  return (
    <section aria-labelledby="heading-action-plan">
      <GlassCard className="border-primary/45 dark:border-border">
        <CardHeader className="border-b border-primary/80 bg-primary/90 px-5 py-4 text-primary-foreground dark:border-border dark:bg-secondary/85 dark:text-foreground">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle
                id="heading-action-plan"
                className="text-xl font-semibold tracking-tight text-primary-foreground dark:text-foreground"
              >
                Your household action plan{city ? ` · ${city.name}` : ""}
              </CardTitle>
              <CardDescription className="mt-0.5 text-sm text-primary-foreground/85 dark:text-muted-foreground">
                Practical steps for your daily routine, home air, and travel.
              </CardDescription>
            </div>

            {fromGemini ? (
              <Badge
                variant="outline"
                className="w-fit rounded-md border-primary-foreground/25 bg-primary-foreground/15 px-2.5 py-1 text-xs font-medium text-primary-foreground dark:border-border dark:bg-card/85 dark:text-foreground"
              >
                <Sparkles className="size-3.5 dark:text-primary" aria-hidden="true" />
                <span>Personalized with Gemini</span>
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="w-fit rounded-md border-warning-border bg-warning-surface px-2.5 py-1 text-xs font-medium text-warning"
              >
                <ShieldAlert className="size-3.5" aria-hidden="true" />
                <span>{isFallback ? "General guidance" : "Unverified source"}</span>
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-5">
          <Alert
            className={cn(
              isLimited || isFallback
                ? "border-warning-border bg-warning-surface/90 text-warning"
                : "border-sage/70 bg-(--glass-subcard-bg) text-foreground shadow-xs"
            )}
          >
            {isLimited || isFallback ? (
              <AlertTriangle className="size-4" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="size-4 text-station" aria-hidden="true" />
            )}
            <AlertTitle className="text-sm font-semibold">
              {fromGemini ? "How this plan was built" : "Fallback notice"}
            </AlertTitle>
            <AlertDescription className="text-xs leading-relaxed text-current/90">
              {fromGemini
                ? PLAN_BASIS_COPY[plan.basis]
                : isFallback
                  ? "General guidance shown because AI selection was unavailable."
                  : "Recommendation source could not be verified."}
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 lg:grid-cols-3">
            {cards.map(({ type, category, focusLabel, icon: Icon, action }) => {
              const circumstances = getRelevantCircumstances(type, profile, plan);
              const helpSummary = ACTION_BENEFIT_SUMMARY[action.id];

              return (
                <article
                  key={type}
                  className="flex flex-col justify-between rounded-lg border border-border/85 bg-(--glass-subcard-bg) p-4 shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="grid size-8 shrink-0 place-items-center rounded-md border border-station-border bg-station-surface text-station"
                        aria-hidden="true"
                      >
                        <Icon className="size-4" strokeWidth={1.75} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{category}</h3>
                        <p className="text-xs text-muted-foreground">{focusLabel}</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="text-xs font-medium text-muted-foreground">What to do</div>
                      <h4 className="mt-1 text-base font-semibold leading-snug text-foreground">
                        {action.title}
                      </h4>
                    </div>

                    <div className="rounded-md border border-border/80 bg-(--glass-cell-bg) p-3">
                      <div className="text-xs font-medium text-foreground">Why it matters</div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {action.why}
                      </p>
                      {helpSummary && (
                        <p className="mt-2 border-t border-border/70 pt-2 text-xs leading-relaxed text-foreground/85">
                          <span className="font-medium">How it helps:</span> {helpSummary}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 border-t border-border/70 pt-3">
                    <div className="mb-1.5 text-xs font-medium text-muted-foreground">
                      Tailored for
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {circumstances.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="rounded-md text-[11px] font-normal text-secondary-foreground"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex items-start gap-2 rounded-md border border-border/80 bg-(--glass-cell-bg) px-3.5 py-2.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span>
              Indoor advice is general. Outdoor station and model readings do not measure the air
              inside your home.
            </span>
          </div>
        </CardContent>
      </GlassCard>
    </section>
  );
}
