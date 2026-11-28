"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ActionPlanPanel } from "@/components/action-plan/ActionPlanPanel";
import { AirQualityDashboard } from "@/components/air-quality/AirQualityDashboard";
import { AtmosphericBackground } from "@/components/atmosphere/AtmosphericBackground";
import { CloudLayers } from "@/components/atmosphere/CloudLayers";
import { AboutDataSection } from "@/components/guidance/AboutDataSection";
import { HealthSafetySection } from "@/components/guidance/HealthSafetySection";
import { HouseholdProfileForm } from "@/components/household/HouseholdProfileForm";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LocationSelector } from "@/components/location/LocationSelector";
import { useTheme } from "@/components/theme/ThemeProvider";
import { computeAtmosphereState } from "@/lib/atmosphere";
import {
  findNearestSupportedMetro,
  requestJson,
  type AppViewTab,
  type LocationOrigin,
} from "@/lib/air-quality-utils";
import { members, type AirQuality, type City, type Plan, type Profile } from "@/lib/contracts";

const INITIAL_PROFILE: Profile = {
  members: [],
  commute: "No regular commute",
  priority: "Flexible errands",
};

export function VayuSaathiApp() {
  const [activeTab, setActiveTab] = useState<AppViewTab>("assistant");
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<City[] | null>(null);
  const [city, setCity] = useState<City | null>(null);
  const [locationOrigin, setLocationOrigin] = useState<LocationOrigin>("default");
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [locationNotice, setLocationNotice] = useState("");

  const [air, setAir] = useState<AirQuality | null>(null);
  const [airError, setAirError] = useState("");
  const [airAttempt, setAirAttempt] = useState(0);

  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [planError, setPlanError] = useState("");
  const [generating, setGenerating] = useState(false);

  const { resolvedTheme } = useTheme();
  const planRequest = useRef<AbortController | null>(null);
  useEffect(() => () => planRequest.current?.abort(), []);

  function invalidatePlanRequest() {
    planRequest.current?.abort();
    planRequest.current = null;
    setGenerating(false);
  }

  const userChoseSearch = useRef(false);
  const cityId = city?.id;
  const loadingAir = Boolean(city && !air && !airError);
  const atmosphere = useMemo(
    () => computeAtmosphereState({ city, air, loading: loadingAir, theme: resolvedTheme }),
    [city, air, loadingAir, resolvedTheme]
  );

  useEffect(() => {
    const controller = new AbortController();
    requestJson<{ cities: City[] }>("/api/cities?q=Delhi", { signal: controller.signal })
      .then(({ cities }) => {
        if (!controller.signal.aborted && !userChoseSearch.current && cities[0]) {
          setCity(cities[0]);
          setLocationOrigin("default");
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!cityId) return;
    const controller = new AbortController();
    requestJson<AirQuality>("/api/air-quality?cityId=" + cityId, { signal: controller.signal })
      .then((result) => {
        if (!controller.signal.aborted) {
          setAir(result);
        }
      })
      .catch((err: Error) => {
        if (!controller.signal.aborted) {
          setAirError(err.message || "Failed to retrieve air quality data.");
        }
      });
    return () => controller.abort();
  }, [cityId, airAttempt]);

  function chooseCity(next: City, origin: LocationOrigin = "selected") {
    setLocationOrigin(origin);
    setMatches(null);
    setActiveTab("assistant");
    if (next.id === cityId) return;

    invalidatePlanRequest();
    setCity(next);
    setAir(null);
    setAirError("");
    setPlan(null);
    setPlanError("");
  }

  async function runCitySearch(
    searchQuery: string,
    notice?: string,
    originOnSingleMatch: LocationOrigin = "selected"
  ) {
    const term = searchQuery.trim();
    if (term.length < 2) return;
    userChoseSearch.current = true;
    setQuery(term);
    setSearching(true);
    setSearchError("");
    setMatches(null);
    setLocationNotice(notice ?? "");

    try {
      const result = await requestJson<{ cities: City[] }>(
        "/api/cities?q=" + encodeURIComponent(term)
      );
      if (!result.cities.length) {
        setMatches([]);
        return;
      }
      if (result.cities.length === 1) {
        chooseCity(result.cities[0], originOnSingleMatch);
      } else {
        setMatches(result.cities);
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "City search failed. Try again.");
    } finally {
      setSearching(false);
    }
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setLocationNotice("Location access is unavailable in this browser. Search by city name instead.");
      return;
    }
    userChoseSearch.current = true;
    setLocating(true);
    setLocationNotice("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocating(false);
        const { metro, withinRange } = findNearestSupportedMetro(
          position.coords.latitude,
          position.coords.longitude
        );
        if (!withinRange) {
          setLocationNotice(
            "Your location is more than 50 km from our five quick-locate metros. Please search for your city or town above."
          );
          return;
        }
        await runCitySearch(
          metro.name,
          `Nearest supported city: ${metro.name}. Showing readings for ${metro.name}.`,
          "detected"
        );
      },
      () => {
        setLocating(false);
        setLocationNotice("Could not access your browser location. Please search by city name.");
      },
      { timeout: 7000 }
    );
  }

  function clearSearch() {
    userChoseSearch.current = true;
    setQuery("");
    setMatches(null);
    setSearchError("");
    setLocationNotice("");
  }

  function refreshAirReadings() {
    if (!city) return;
    invalidatePlanRequest();
    setAir(null);
    setAirError("");
    setPlan(null);
    setPlanError("");
    setAirAttempt((v) => v + 1);
  }

  function toggleMember(member: (typeof members)[number]) {
    setProfile((prev) => {
      const exists = prev.members.includes(member);
      const updated = exists ? prev.members.filter((m) => m !== member) : [...prev.members, member];
      return { ...prev, members: updated };
    });
    setPlan(null);
    setPlanError("");
  }

  function updateCommute(commute: Profile["commute"]) {
    setProfile((prev) => ({ ...prev, commute }));
    setPlan(null);
    setPlanError("");
  }

  function updatePriority(priority: Profile["priority"]) {
    setProfile((prev) => ({ ...prev, priority }));
    setPlan(null);
    setPlanError("");
  }

  async function requestActionPlan() {
    if (!city || loadingAir || generating) return;
    if (!profile.members.length) {
      setPlanError("Please select at least one household member.");
      return;
    }
    if (planRequest.current) return;
    const request = new AbortController();
    planRequest.current = request;
    setGenerating(true);
    setPlanError("");
    setPlan(null);

    try {
      const result = await requestJson<{ air: AirQuality; plan: Plan }>("/api/recommendations", {
        method: "POST",
        signal: request.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityId: city.id, profile }),
      });
      if (planRequest.current !== request || request.signal.aborted) return;
      if (result.air.city.id !== city.id) {
        throw new Error("The plan response did not match the selected city.");
      }
      setAir(result.air);
      setAirError("");
      setPlan(result.plan);
    } catch (err) {
      if (planRequest.current === request && !request.signal.aborted) {
        setPlanError(err instanceof Error ? err.message : "An action plan could not be generated.");
      }
    } finally {
      if (planRequest.current === request && !request.signal.aborted) {
        planRequest.current = null;
        setGenerating(false);
      }
    }
  }

  function handlePlanSubmit(event: FormEvent) {
    event.preventDefault();
    void requestActionPlan();
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as AppViewTab)}
      className="relative flex min-h-screen flex-col gap-0"
    >
      {/* Single fixed viewport-sized atmospheric background (static sky and drifting cloud layers) */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-background transition-colors duration-700 ease-out motion-reduce:transition-none"
        style={{
          background: atmosphere.cloudsActive
            ? `linear-gradient(180deg, ${atmosphere.skyTop} 0%, ${atmosphere.skyBottom} 58%, ${atmosphere.pageWash} 100%)`
            : undefined,
        }}
        aria-hidden="true"
      >
        {atmosphere.cloudsActive && (
          <CloudLayers
            speed={atmosphere.cloudSpeed}
            count={atmosphere.cloudCount}
            color={atmosphere.cloudColor}
          />
        )}
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <a className="skip-link" href="#main">
          Skip to main content
        </a>

        <SiteHeader activeTab={activeTab} />

        <main id="main" tabIndex={-1} className="flex-1 bg-transparent outline-none">
          <AtmosphericBackground city={city} atmosphere={atmosphere}>
            <LocationSelector
              query={query}
              onQueryChange={(value) => {
                setQuery(value);
                setSearchError("");
                setMatches(null);
                setLocationNotice("");
              }}
              matches={matches}
              onDismissMatches={() => setMatches(null)}
              city={city}
              searching={searching}
              locating={locating}
              searchError={searchError}
              locationNotice={locationNotice}
              onSearch={(term) => void runCitySearch(term)}
              onChooseCity={(selected, origin) => chooseCity(selected, origin ?? "selected")}
              onUseLocation={handleUseLocation}
              onClearSearch={clearSearch}
            />
          </AtmosphericBackground>

          <div className="mx-auto w-full max-w-[1380px] px-4 pt-6 sm:px-6">
            <TabsContent value="assistant" className="mt-0 space-y-6">
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.16fr)_minmax(0,0.84fr)]">
                <AirQualityDashboard
                  city={city}
                  locationOrigin={locationOrigin}
                  air={air}
                  airError={airError}
                  loadingAir={loadingAir}
                  generatingPlan={generating}
                  onRefresh={refreshAirReadings}
                />

                <HouseholdProfileForm
                  profile={profile}
                  validationError={planError}
                  disabled={generating}
                  generating={generating}
                  canGenerate={Boolean(city && !loadingAir && profile.members.length > 0)}
                  onToggleMember={toggleMember}
                  onCommuteChange={updateCommute}
                  onPriorityChange={updatePriority}
                  onSubmit={handlePlanSubmit}
                />
              </div>

              <div className="sr-only" role="status" aria-live="polite">
                {plan ? "Your personalized household action plan is ready below." : ""}
              </div>

              <ActionPlanPanel
                city={city}
                profile={profile}
                plan={plan}
                generating={generating}
                planError={profile.members.length > 0 ? planError : ""}
                canRetry={Boolean(city && !loadingAir && profile.members.length > 0)}
                onRetry={() => void requestActionPlan()}
              />
            </TabsContent>

            <TabsContent value="about-data" className="mt-0">
              <AboutDataSection />
            </TabsContent>

            <TabsContent value="health-guide" className="mt-0">
              <HealthSafetySection />
            </TabsContent>
          </div>
        </main>

        <SiteFooter />
      </div>
    </Tabs>
  );
}
