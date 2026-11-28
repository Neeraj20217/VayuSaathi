"use client";

import { Clock, Info, Layers3, Radio, ShieldCheck } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";

export function AboutDataSection() {
  return (
    <section aria-labelledby="heading-about-data" className="space-y-6">
      <GlassCard>
        <CardHeader className="border-b border-border/80 px-5 py-4">
          <CardTitle id="heading-about-data" className="text-xl font-semibold tracking-tight">
            About the data
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            How VayuSaathi separates nearby monitoring station measurements from regional computer
            model estimates.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-5">
          <Alert className="border-border/85 bg-(--glass-subcard-bg)">
            <Info className="size-4 text-primary" aria-hidden="true" />
            <AlertTitle className="text-sm font-semibold">
              Particle amounts in µg/m³, not AQI scores
            </AlertTitle>
            <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
              VayuSaathi displays outdoor PM2.5 and PM10 concentrations in µg/m³ directly from its
              sources. A single reading does not represent an official AQI category or guarantee safe
              outdoor activity.
            </AlertDescription>
          </Alert>

          <p className="text-sm leading-relaxed text-muted-foreground">
            The atmospheric background is illustrative. Its colors and clouds respond to recent
            local station observations when available, or to regional Open-Meteo / CAMS estimates.
            Without recent readings it stays neutral. The artwork does not show live sky conditions.
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col justify-between rounded-lg border border-station-border bg-(--glass-subcard-bg)">
              <div className="flex items-center justify-between gap-2 border-b border-station-border/70 bg-station-surface/65 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Radio className="size-4 text-station" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Nearby monitoring stations
                  </h3>
                </div>
                <Badge
                  variant="outline"
                  className="rounded-md border-station-border bg-card text-xs text-station"
                >
                  OpenAQ API v3
                </Badge>
              </div>
              <div className="space-y-3 p-4 text-sm text-muted-foreground">
                <p className="leading-relaxed">
                  Physical air monitors operated by Indian public agencies such as CPCB, DPCC,
                  IITM, and state pollution control boards.
                </p>
                <Separator />
                <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-foreground">Search area</dt>
                    <dd>Within 25 km of the selected city centre</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Timestamp shown</dt>
                    <dd>When the station took the reading (IST)</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Separate sensors</dt>
                    <dd>PM2.5 and PM10 may come from different nearby stations</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">When unavailable</dt>
                    <dd>Clearly labeled as missing or unavailable</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-lg border border-model-border bg-(--glass-subcard-bg)">
              <div className="flex items-center justify-between gap-2 border-b border-model-border/70 bg-model-surface/75 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Layers3 className="size-4 text-model" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Regional air quality estimates
                  </h3>
                </div>
                <Badge
                  variant="outline"
                  className="rounded-md border-model-border bg-card text-xs text-model"
                >
                  Open-Meteo / CAMS
                </Badge>
              </div>
              <div className="space-y-3 p-4 text-sm text-muted-foreground">
                <p className="leading-relaxed">
                  Regional simulations from the Copernicus Atmosphere Monitoring Service (CAMS),
                  kept separate so modeled estimates are never confused with physical ground
                  sensors.
                </p>
                <Separator />
                <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-foreground">Grid area</dt>
                    <dd>About 45 km wide over India</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Timestamp shown</dt>
                    <dd>Time the estimate applies to (IST)</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">How it works</dt>
                    <dd>Combines satellite data with weather and air-chemistry models</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Why it helps</dt>
                    <dd>Provides regional context for towns without nearby stations</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border/85 bg-(--glass-subcard-bg) px-4">
            <Accordion type="multiple" defaultValue={["freshness"]}>
              <AccordionItem value="freshness">
                <AccordionTrigger className="text-sm font-semibold text-foreground">
                  <span className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span>How recent the readings are (IST)</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    All observation and model validity times are displayed in Indian Standard Time
                    (IST, UTC+05:30). Readings are grouped by age:
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-xs">
                    <li>
                      <strong className="text-foreground">Recent (up to 3 hours old):</strong> Used
                      to tailor your household recommendations.
                    </li>
                    <li>
                      <strong className="text-foreground">Delayed (3 to 24 hours old):</strong>{" "}
                      Marked with a delayed badge; outdoor air may have changed since then.
                    </li>
                    <li>
                      <strong className="text-foreground">Outdated (over 24 hours old):</strong>{" "}
                      Marked as outdated and excluded from household recommendations.
                    </li>
                    <li>
                      <strong className="text-foreground">Future-dated:</strong> Filtered out when
                      a provider timestamp appears ahead of current time.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="uncertainty">
                <AccordionTrigger className="text-sm font-semibold text-foreground">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />
                    <span>Coverage limits and uncertainty</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Air pollution can vary sharply between busy roads, construction zones, and
                    quieter streets. A monitor several kilometres away—or a ~45 km model grid—cannot
                    measure street-level spikes or the air inside your home.
                  </p>
                  <p>
                    The browser location button matches only five supported major metros within
                    50 km; for all other Indian cities and towns, search by name.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CardContent>
      </GlassCard>
    </section>
  );
}
