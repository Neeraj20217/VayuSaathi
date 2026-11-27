import { Wind } from "lucide-react";

export function SiteFooter() {
  return (
    <footer
      id="about-project"
      className="glass-footer mt-12 border-t border-(--glass-border)/60"
    >
      <div className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6">
        <div className="grid gap-8 md:grid-cols-[1.3fr_1fr_1fr]">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div
                className="grid size-7 place-items-center rounded-md border border-station-border bg-station-surface text-station dark:border-primary/45 dark:bg-primary/15 dark:text-primary"
                aria-hidden="true"
              >
                <Wind className="size-4" strokeWidth={1.75} />
              </div>
              <span className="text-base font-semibold tracking-tight text-foreground">
                VayuSaathi
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              An urban air quality assistant for Indian households, pairing nearby monitoring
              station readings with regional estimates to support everyday decisions.
            </p>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-sm font-semibold text-foreground">Data &amp; scientific sources</h2>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://openaq.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-border underline-offset-4 transition-colors hover:text-primary"
                >
                  OpenAQ API v3 (monitoring stations)
                </a>
              </li>
              <li>
                <a
                  href="https://open-meteo.com/en/docs/air-quality-api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-border underline-offset-4 transition-colors hover:text-primary"
                >
                  Open-Meteo &amp; Copernicus CAMS
                </a>
              </li>
              <li>
                <a
                  href="https://www.geonames.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-border underline-offset-4 transition-colors hover:text-primary"
                >
                  GeoNames Indian place search
                </a>
              </li>
              <li>
                <a
                  href="https://ai.google.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-border underline-offset-4 transition-colors hover:text-primary"
                >
                  Google Gemini (action selection)
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-sm font-semibold text-foreground">Scope &amp; limitations</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Shows outdoor PM2.5 and PM10 levels in µg/m³ only. Station searches cover a 25 km
              radius; regional estimates use a ~45 km grid. Not a substitute for indoor monitors or
              medical advice.
            </p>
            <p className="text-sm">
              <a
                href="https://www.epa.gov/indoor-air-quality-iaq/indoor-particulate-matter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
              >
                US EPA guidance on indoor particles
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
