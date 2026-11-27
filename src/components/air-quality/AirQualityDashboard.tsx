"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Clock,
  Info,
  Layers3,
  Radio,
  RotateCw,
  Wind,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { TiltCard } from "@/components/ui/tilt-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  formatConcentration,
  formatIstTimestamp,
  FRESHNESS_META,
  getDataSourceMessage,
  POLLUTANT_EXPLANATIONS,
  summarizeDataFreshness,
  type LocationOrigin,
} from "@/lib/air-quality-utils";
import {
  eligibleForGrounding,
  pollutantNames,
  pollutants,
  type AirQuality,
  type City,
  type DataSource,
  type Reading,
} from "@/lib/contracts";
import { cn } from "@/lib/utils";

interface AirQualityDashboardProps {
  city: City | null;
  locationOrigin: LocationOrigin;
  air: AirQuality | null;
  airError: string;
  loadingAir: boolean;
  generatingPlan: boolean;
  onRefresh: () => void;
}

export function AirQualityDashboard({
  city,
  locationOrigin,
  air,
  airError,
  loadingAir,
  generatingPlan,
  onRefresh,
}: AirQualityDashboardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!city) {
    return (
      <GlassCard>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <div
            className="mb-3 grid size-12 place-items-center rounded-lg border border-station-border bg-station-surface text-station"
            aria-hidden="true"
          >
            <Wind className="size-6" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Choose an Indian city or town to check air quality
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-muted-foreground">
            Search above to see nearby monitoring station readings alongside regional air quality
            estimates.
          </p>
        </CardContent>
      </GlassCard>
    );
  }

  const originBadge =
    locationOrigin === "default"
      ? "Default city"
      : locationOrigin === "detected"
        ? "Detected nearby city"
        : "Selected city";

  const locationSubtitle = [city.locality, city.region, "India"].filter(Boolean).join(", ");
  const freshnessSummary = air ? summarizeDataFreshness(air) : null;

  return (
    <GlassCard>
      <CardHeader className="flex flex-col gap-3 border-b border-border/80 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
              {city.name}
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(
                "rounded-md text-xs font-medium",
                locationOrigin === "detected"
                  ? "border-model-border bg-model-surface text-model"
                  : locationOrigin === "selected"
                    ? "border-station-border bg-station-surface text-station"
                    : "border-border bg-muted text-muted-foreground"
              )}
            >
              {originBadge}
            </Badge>
          </div>
          <CardDescription className="text-sm text-muted-foreground">
            {locationSubtitle} · Outdoor particle levels (µg/m³)
          </CardDescription>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loadingAir || generatingPlan}
          aria-label="Refresh air quality readings"
          className="min-h-11 shrink-0 self-start px-3.5 text-sm font-medium"
        >
          <RotateCw
            className={cn("size-4", loadingAir && "animate-spin")}
            aria-hidden="true"
          />
          <span>{loadingAir ? "Refreshing…" : "Refresh"}</span>
        </Button>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        {airError && (
          <Alert
            variant="destructive"
            className="border-danger-border bg-danger-surface text-destructive"
          >
            <AlertTriangle className="size-4" aria-hidden="true" />
            <AlertTitle>Could not load outdoor readings</AlertTitle>
            <AlertDescription className="space-y-2.5">
              <p>{airError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={generatingPlan}
                className="min-h-11 border-danger-border bg-card text-destructive hover:bg-danger-surface"
              >
                <RotateCw className="size-3.5" aria-hidden="true" />
                <span>Retry readings</span>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {loadingAir && !air && <TelemetryLoadingSkeleton cityName={city.name} />}

        {/* Single consolidated freshness notice shown above both data sections only when needed */}
        {freshnessSummary?.shouldShow && (
          <Alert
            variant={freshnessSummary.tone === "destructive" ? "destructive" : "default"}
            className={cn(
              freshnessSummary.tone === "destructive"
                ? "border-danger-border bg-danger-surface text-destructive"
                : "border-warning-border bg-warning-surface text-warning"
            )}
          >
            <AlertTriangle className="size-4" aria-hidden="true" />
            <AlertTitle className="text-sm font-semibold">Data freshness</AlertTitle>
            <AlertDescription className="space-y-1 text-xs leading-relaxed text-current">
              {freshnessSummary.messages.map((msg) => (
                <p key={msg}>{msg}</p>
              ))}
              {freshnessSummary.excludedItems.length > 0 && (
                <p className="font-medium">
                  Excluded from recommendations: {freshnessSummary.excludedItems.join(", ")}.
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {air && (
          <div className="space-y-4">
            <StreamSection kind="measured" data={air.measured} />
            <StreamSection kind="modeled" data={air.modeled} />
          </div>
        )}

        <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
          <div className="rounded-lg border border-border/80 bg-(--glass-cell-bg) px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
            <p>
              Station monitors cover up to 25 km from the city centre; regional estimates represent
              a ~45 km grid. Readings show outdoor concentrations only.
            </p>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="mt-2 inline-flex min-h-9 items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span>
                  {detailsOpen
                    ? "Hide measurement details"
                    : "How station readings and regional estimates differ"}
                </span>
                <ChevronDown
                  className={cn("size-3.5 transition-transform", detailsOpen && "rotate-180")}
                  aria-hidden="true"
                />
              </button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2.5 space-y-2 border-t border-border pt-2.5 text-xs text-muted-foreground">
              <p>
                <strong className="font-medium text-foreground">Nearby monitoring stations (OpenAQ):</strong>{" "}
                Physical sensors run by agencies such as CPCB, DPCC, IITM, and state boards. PM2.5
                and PM10 may come from different nearby stations, each listed with its own distance
                and observation time.
              </p>
              <p>
                <strong className="font-medium text-foreground">Regional estimates (Open-Meteo / CAMS):</strong>{" "}
                A computer simulation covering a ~45 km area. Helpful where nearby ground monitors
                are unavailable, labeled with model validity time in IST.
              </p>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </CardContent>
    </GlassCard>
  );
}

function TelemetryLoadingSkeleton({ cityName }: { cityName: string }) {
  return (
    <div className="space-y-4" role="status" aria-label={`Loading air quality for ${cityName}`}>
      <p className="text-xs font-medium text-muted-foreground">
        Checking nearby monitoring stations and regional estimates for {cityName}…
      </p>
      {[0, 1].map((idx) => (
        <div key={idx} className="space-y-3 rounded-lg border border-border/85 bg-(--glass-subcard-bg) p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-3 w-64" />
        </div>
      ))}
    </div>
  );
}

function StreamSection({ kind, data }: { kind: "measured" | "modeled"; data: DataSource }) {
  const isMeasured = kind === "measured";
  const Icon = isMeasured ? Radio : Layers3;
  const notice = getDataSourceMessage(kind, data.status);

  return (
    <section
      aria-label={isMeasured ? "Nearby monitoring stations" : "Regional air quality estimates"}
      className={cn(
        "overflow-hidden rounded-lg border bg-(--glass-subcard-bg)",
        isMeasured ? "border-station-border" : "border-model-border"
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 border-b px-4 py-2.5",
          isMeasured
            ? "border-station-border/70 bg-station-surface/70"
            : "border-model-border/70 bg-model-surface/75"
        )}
      >
        <div className="flex items-center gap-2">
          <Icon
            className={cn("size-4 shrink-0", isMeasured ? "text-station" : "text-model")}
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <h3 className="text-sm font-semibold text-foreground">
            {isMeasured ? "Nearby monitoring stations" : "Regional air quality estimates"}
          </h3>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "rounded-md bg-card text-xs font-medium",
            isMeasured ? "border-station-border text-station" : "border-model-border text-model"
          )}
        >
          {isMeasured ? "OpenAQ stations" : "Open-Meteo / CAMS"}
        </Badge>
      </div>

      <div className="space-y-3 p-4">
        {notice && (
          <Alert className="border-border bg-muted/55 py-2.5 text-foreground">
            <Info className="size-4 text-muted-foreground" aria-hidden="true" />
            <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
              {notice}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {pollutants.map((pollutant) => {
            const reading = data.readings.find((r) => r.pollutant === pollutant);
            return (
              <PollutantCell
                key={pollutant}
                pollutant={pollutant}
                reading={reading}
                isMeasured={isMeasured}
              />
            );
          })}
        </div>

        <Separator />

        {isMeasured ? (
          <p className="text-xs text-muted-foreground">
            Measured at physical outdoor stations within 25 km via OpenAQ.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>Computer model estimate (~45 km grid), not a local street sensor.</span>
            {data.readings[0]?.timestamp && (
              <span className="inline-flex items-center gap-1.5 font-mono text-model">
                <Clock className="size-3.5 shrink-0" aria-hidden="true" />
                <time dateTime={data.readings[0].timestamp}>
                  Valid: {formatIstTimestamp(data.readings[0].timestamp)}
                </time>
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function PollutantCell({
  pollutant,
  reading,
  isMeasured,
}: {
  pollutant: (typeof pollutants)[number];
  reading: Reading | undefined;
  isMeasured: boolean;
}) {
  const info = POLLUTANT_EXPLANATIONS[pollutant];
  const freshnessInfo = reading ? FRESHNESS_META[reading.freshness] : null;
  const isExcluded = reading && !eligibleForGrounding(reading);

  return (
    <TiltCard
      maxTilt={5}
      hoverScale={1.01}
      glareOpacity={0.13}
      className="flex flex-col justify-between rounded-md border border-border/85 bg-(--glass-cell-bg) p-3.5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-foreground">{pollutantNames[pollutant]}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`What is ${info.shortName}?`}
                className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                <Info className="size-3.5" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[260px] space-y-1 p-2.5 text-xs leading-relaxed">
              <div className="font-semibold">{info.fullName}</div>
              <div>{info.summary}</div>
            </TooltipContent>
          </Tooltip>
        </div>

        {freshnessInfo && (
          <Badge
            variant="outline"
            className={cn(
              "rounded-md text-[11px] font-medium",
              freshnessInfo.tone === "recent" &&
                (isMeasured
                  ? "border-border bg-secondary text-secondary-foreground"
                  : "border-model-border bg-model-surface text-model"),
              (freshnessInfo.tone === "delayed" || freshnessInfo.tone === "stale") &&
                "border-warning-border bg-warning-surface text-warning",
              freshnessInfo.tone === "future" &&
                "border-danger-border bg-danger-surface text-destructive"
            )}
          >
            {freshnessInfo.label}
          </Badge>
        )}
      </div>

      {reading ? (
        <div className="mt-2 space-y-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-3xl font-semibold tracking-tight text-foreground tabular-nums">
              {formatConcentration(reading.value)}
            </span>
            <span className="text-xs font-medium text-muted-foreground">{reading.unit}</span>
          </div>

          {isExcluded && (
            <p className="text-xs font-medium text-warning">
              Not used for recommendations
            </p>
          )}

          {isMeasured && (
            <div className="space-y-0.5 border-t border-border/80 pt-2 text-xs text-muted-foreground">
              <div className="font-mono text-[11px]">
                <time dateTime={reading.timestamp}>
                  Observed: {formatIstTimestamp(reading.timestamp)}
                </time>
              </div>
              {reading.station && (
                <div className="font-medium leading-snug text-foreground/85">
                  {reading.station.name} · {reading.station.provider} ·{" "}
                  <span className="tabular-nums">{reading.station.distanceKm.toFixed(1)} km</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-1">
          <div className="text-sm font-medium text-muted-foreground">Unavailable</div>
          <p className="text-xs text-muted-foreground">
            No {pollutantNames[pollutant]} reading reported.
          </p>
        </div>
      )}
    </TiltCard>
  );
}
