"use client";

import { Footprints, House, Info, ShieldCheck, User, Wind } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";

export function HealthSafetySection() {
  return (
    <section aria-labelledby="heading-health-safety" className="space-y-6">
      <GlassCard>
        <CardHeader className="border-b border-border/80 px-5 py-4">
          <CardTitle id="heading-health-safety" className="text-xl font-semibold tracking-tight">
            Health &amp; safety guide
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Everyday guidance on outdoor particle pollution, indoor air care, and lower-emission
            travel.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5 p-5">
          <Alert className="border-border/85 bg-(--glass-subcard-bg) text-foreground">
            <Info className="size-4 text-primary" aria-hidden="true" />
            <AlertTitle className="text-sm font-semibold">Understanding our guidance</AlertTitle>
            <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
              These readings describe outdoor air quality, not the air inside your home. No
              individual reading guarantees safe outdoor activity. Our recommendations provide
              general guidance, not medical advice. Follow local public-health advisories.
            </AlertDescription>
          </Alert>

          <div className="rounded-lg border border-border/85 bg-(--glass-subcard-bg) px-4">
            <Accordion type="multiple" defaultValue={["particles", "indoor"]}>
              <AccordionItem value="particles">
                <AccordionTrigger className="text-sm font-semibold text-foreground">
                  <span className="flex items-center gap-2">
                    <Wind className="size-4 text-station" aria-hidden="true" />
                    <span>What PM2.5 and PM10 mean</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">PM2.5</strong> refers to fine particles 2.5
                    micrometres across or smaller. <strong className="text-foreground">PM10</strong>{" "}
                    includes inhalable particles up to 10 micrometres across, including PM2.5. Fine
                    particles can reach deep into the lungs.
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-xs">
                    <li>Common sources include vehicle exhaust, road and construction dust, and smoke.</li>
                    <li>Check local public-health advisories before strenuous outdoor activity.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="sensitive">
                <AccordionTrigger className="text-sm font-semibold text-foreground">
                  <span className="flex items-center gap-2">
                    <User className="size-4 text-station" aria-hidden="true" />
                    <span>Household members who may be more sensitive</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Children, older adults, and people with heart or lung conditions can be more
                    affected by particle pollution. Keeping an indoor option ready for optional
                    outdoor activities helps limit exposure when local advisories report poor air.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="indoor">
                <AccordionTrigger className="text-sm font-semibold text-foreground">
                  <span className="flex items-center gap-2">
                    <House className="size-4 text-station" aria-hidden="true" />
                    <span>Reducing particles inside your home</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Outdoor particles can drift indoors, and cooking or indoor smoke can add to
                    particles inside living spaces.
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-xs">
                    <li>Use a kitchen exhaust fan that vents outdoors while cooking, if available.</li>
                    <li>Avoid unnecessary indoor smoke from incense, candles, and tobacco.</li>
                    <li>
                      If you already use an air purifier, follow the manufacturer&apos;s instructions
                      and replace filters on schedule.
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="travel">
                <AccordionTrigger className="text-sm font-semibold text-foreground">
                  <span className="flex items-center gap-2">
                    <Footprints className="size-4 text-station" aria-hidden="true" />
                    <span>Lower-emission travel and commute habits</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    Combining errands into one trip or using shared or public transport when
                    practical helps cut down separate vehicle journeys.
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-xs">
                    <li>Switch off your engine while safely parked and waiting.</li>
                    <li>Prefer quieter streets away from heavy traffic when walking or cycling.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-border/85 bg-(--glass-cell-bg) p-3.5 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-station" aria-hidden="true" />
            <span>
              Reference:{" "}
              <a
                href="https://www.epa.gov/indoor-air-quality-iaq/indoor-particulate-matter"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground underline decoration-border underline-offset-4 hover:text-primary"
              >
                US EPA Indoor Particulate Matter Guidance
              </a>
              .
            </span>
          </div>
        </CardContent>
      </GlassCard>
    </section>
  );
}
