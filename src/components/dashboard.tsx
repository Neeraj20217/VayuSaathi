"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Baby,
  Briefcase,
  Bus,
  Car,
  Check,
  Clock,
  Compass,
  Footprints,
  GraduationCap,
  House,
  Info,
  Layers3,
  LocateFixed,
  MapPin,
  Radio,
  RotateCw,
  Search,
  ShieldCheck,
  User,
  Wind,
  X,
} from "lucide-react";
import {
  commutes,
  members,
  pollutantNames,
  pollutants,
  priorities,
  type AirQuality,
  type City,
  type DataSource,
  type Plan,
  type Profile,
} from "@/lib/contracts";

const popularCities = [
  { name: "Delhi", query: "Delhi", code: "DEL", region: "National Capital Territory of Delhi" },
  { name: "Mumbai", query: "Mumbai", code: "BOM", region: "Maharashtra" },
  { name: "Kolkata", query: "Kolkata", code: "CCU", region: "West Bengal" },
  { name: "Bengaluru", query: "Bengaluru", code: "BLR", region: "Karnataka" },
  { name: "Hyderabad", query: "Hyderabad", code: "HYD", region: "Telangana" },
];

const startProfile: Profile = {
  members: [],
  commute: "No regular commute",
  priority: "Flexible errands",
};

const date = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

const tabs = [
  { id: "recommendations", label: "Air quality & plan", icon: Wind },
  { id: "about-data", label: "About the data", icon: Info },
  { id: "health-safety", label: "Health & safety guide", icon: ShieldCheck },
] as const;
type Tab = (typeof tabs)[number]["id"];

const states = {
  recent: "Recent",
  delayed: "Delayed",
  stale: "Stale",
  future: "Future",
};

const planBasis = {
  "recent-station": "Grounded in recent nearby station observations from OpenAQ.",
  "recent-model": "Grounded in recent Open-Meteo & CAMS modeled estimates. Recent station readings were unavailable.",
  limited: "Recent local data was unavailable. Check local advisories before planning outdoor activities.",
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(typeof data?.error === "string" ? data.error : "The request could not be completed.");
  }
  if (data === null) throw new Error("The server returned an unreadable response. Try again.");
  return data as T;
}

export function Dashboard() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<City[] | null>(null);
  const [city, setCity] = useState<City | null>(null);
  const [isDefaultCity, setDefaultCity] = useState(false);
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading">("idle");
  const [searchError, setSearchError] = useState("");
  const [profile, setProfile] = useState<Profile>(startProfile);
  const [activeTab, setActiveTab] = useState<Tab>("recommendations");
  const [locating, setLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState("");

  const searching = searchStatus === "loading";
  const userChoseSearch = useRef(false);
  const searchInput = useRef<HTMLInputElement>(null);

  function chooseCity(next: City) {
    setCity(next);
    setDefaultCity(false);
    setActiveTab("recommendations");
  }

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const positions: Record<string, number> = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    };
    const position = positions[event.key];
    if (typeof position !== "number") return;
    event.preventDefault();
    const next = tabs[position].id;
    setActiveTab(next);
    document.getElementById("tab-" + next)?.focus();
  }

  useEffect(() => {
    const controller = new AbortController();
    requestJson<{ cities: City[] }>("/api/cities?q=Delhi", { signal: controller.signal })
      .then(({ cities }) => {
        if (!controller.signal.aborted && !userChoseSearch.current && cities[0]) {
          setCity(cities[0]);
          setDefaultCity(true);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  async function search(searchQuery: string, notice?: string) {
    const term = searchQuery.trim();
    if (term.length < 2) return;
    userChoseSearch.current = true;
    setQuery(term);
    setSearchStatus("loading");
    setSearchError("");
    setMatches(null);
    setLocationNotice(notice ?? "");
    try {
      const result = await requestJson<{ cities: City[] }>("/api/cities?q=" + encodeURIComponent(term));
      if (!result.cities.length) {
        setMatches([]);
        return;
      }
      if (result.cities.length === 1) {
        chooseCity(result.cities[0]);
      } else {
        setMatches(result.cities);
      }
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "City search failed. Try again.");
    } finally {
      setSearchStatus("idle");
    }
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setLocationNotice("Geolocation is not supported by your browser. Please search by city name.");
      return;
    }
    userChoseSearch.current = true;
    setLocating(true);
    setLocationNotice("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        const metros = [
          { name: "Delhi", lat: 28.65, lon: 77.23 },
          { name: "Mumbai", lat: 18.97, lon: 72.82 },
          { name: "Kolkata", lat: 22.57, lon: 88.36 },
          { name: "Bengaluru", lat: 12.98, lon: 77.59 },
          { name: "Hyderabad", lat: 17.38, lon: 78.47 },
        ];
        let closest = metros[0];
        let minDist = Infinity;
        for (const m of metros) {
          const radians = Math.PI / 180;
          const meanLatitude = (m.lat + latitude) / 2 * radians;
          const d = 6371 * radians * Math.hypot(m.lat - latitude, (m.lon - longitude) * Math.cos(meanLatitude));
          if (d < minDist) {
            minDist = d;
            closest = m;
          }
        }
        if (minDist > 50) {
          setLocationNotice("No supported major metro is within 50 km. Search for your city instead.");
          return;
        }
        await search(closest.name, "Nearby supported metro: " + closest.name + ". Readings are for the selected city.");
      },
      () => {
        setLocating(false);
        setLocationNotice("Could not access your location. Please type your city name.");
      },
      { timeout: 7000 }
    );
  }

  function clearSearch() {
    userChoseSearch.current = true;
    searchInput.current?.focus();
    setQuery("");
    setMatches(null);
    setSearchError("");
    setLocationNotice("");
  }

  return (
    <div className="telemetry-dashboard">
      {/* Functional City Locator Strip */}
      <section className="locator-section" aria-label="City search and location tools">
        <div className="shell">
          <div className="locator-box">
            <form
              className="locator-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!searching && !locating) void search(query);
              }}
            >
              <div className="search-field-group">
                <MapPin size={18} className="search-lead-icon" aria-hidden="true" />
                <label htmlFor="city-query" className="sr-only">
                  Search Indian city or district
                </label>
                <input
                  id="city-query"
                  ref={searchInput}
                  aria-describedby={searchError ? "city-search-error" : undefined}
                  type="search"
                  className="search-field-input"
                  value={query}
                  placeholder="Search city or district (e.g. Delhi, Mumbai, Bengaluru)"
                  required
                  minLength={2}
                  maxLength={80}
                  readOnly={searching || locating}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSearchError("");
                    setMatches(null);
                    setLocationNotice("");
                  }}
                />
                {query && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={clearSearch}
                    disabled={searching || locating}
                    aria-label="Clear city search query"
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="search-actions-group">
                <button
                  type="submit"
                  className="btn-search-submit"
                  disabled={searching || locating || query.trim().length < 2}
                >
                  <Search size={16} aria-hidden="true" />
                  <span>{searching ? "Searching…" : "Search"}</span>
                </button>
                <button
                  type="button"
                  className="btn-location"
                  onClick={handleUseLocation}
                  disabled={locating || searching}
                >
                  <LocateFixed size={16} aria-hidden="true" />
                  <span>{locating ? "Locating…" : "Use my location"}</span>
                </button>
              </div>
            </form>

            {/* Quick Metro Telemetry Keys */}
            <div className="metro-shortcuts-row" role="group" aria-label="Quick-select Indian metros">
              <span className="metro-label">Popular metros:</span>
              <div className="metro-keys-list">
                {popularCities.map((item) => {
                  const isCurrent = city?.name === item.name && city.region === item.region && !city.locality;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      className={`metro-key-btn ${isCurrent ? "active" : ""}`}
                      disabled={searching || locating}
                      onClick={() => void search(item.query)}
                      title={`Search for ${item.name}`}
                    >
                      <span className="metro-code">{item.code}</span>
                      <span className="metro-name">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location Feedback Notice */}
            {locationNotice && (
              <p className="notice-feedback" role="status">
                {locationNotice}
              </p>
            )}

            {/* Search Error Alert */}
            {searchError && (
              <div id="city-search-error" className="error-alert" role="alert">
                <AlertTriangle size={18} aria-hidden="true" />
                <div>
                  <strong>Search query issue:</strong> {searchError}
                </div>
              </div>
            )}

            {/* Disambiguation Dropdown */}
            {matches && matches.length > 0 && (
              <div className="disambiguation-panel" role="region" aria-label="City search matches">
                <div className="disambiguation-header">
                  Matching Indian settlements ({matches.length}):
                </div>
                <ul className="disambiguation-list">
                  {matches.map((item) => {
                    const isSelected = item.id === city?.id;
                    return (
                      <li key={item.id} className="disambiguation-item">
                        <button
                          type="button"
                          className={`disambiguation-btn ${isSelected ? "selected" : ""}`}
                          aria-pressed={isSelected}
                          onClick={() => {
                            chooseCity(item);
                            setMatches(null);
                            searchInput.current?.focus();
                          }}
                        >
                          <div className="item-text-group">
                            <span className="item-city-name">{item.name}</span>
                            <span className="item-location-meta">
                              {[item.locality, item.region, "India"].filter(Boolean).join(" · ")}
                            </span>
                          </div>
                          {isSelected ? (
                            <span className="selected-tag">Selected ✓</span>
                          ) : (
                            <ArrowRight size={15} className="arrow-icon" aria-hidden="true" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {matches && matches.length === 0 && (
              <p className="notice-feedback" role="status">
                No matching Indian locations found. Try checking the spelling or query a nearby district.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Observational Tabs & Primary Content */}
      <div className="shell content-body-wrap">
        <div className="telemetry-tabs" role="tablist" aria-label="Dashboard views">
          {tabs.map(({ id, label, icon: Icon }, index) => (
            <button
              key={id}
              id={"tab-" + id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={"view-" + id}
              tabIndex={activeTab === id ? 0 : -1}
              className={activeTab === id ? "tab-control active" : "tab-control"}
              onClick={() => setActiveTab(id)}
              onKeyDown={(event) => navigateTabs(event, index)}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div
          id="view-recommendations"
          role="tabpanel"
          aria-labelledby="tab-recommendations"
          tabIndex={0}
          hidden={activeTab !== "recommendations"}
        >
          <CityAirView key={city?.id ?? "unselected"} city={city} isDefaultCity={isDefaultCity} profile={profile} setProfile={setProfile} />
        </div>

        <div
          id="view-about-data"
          role="tabpanel"
          aria-labelledby="tab-about-data"
          tabIndex={0}
          hidden={activeTab !== "about-data"}
        >
          <AboutDataView />
        </div>

        <div
          id="view-health-safety"
          role="tabpanel"
          aria-labelledby="tab-health-safety"
          tabIndex={0}
          hidden={activeTab !== "health-safety"}
        >
          <HealthSafetyView />
        </div>
      </div>
    </div>
  );
}

function CityAirView({
  city,
  profile,
  setProfile,
  isDefaultCity,
}: {
  city: City | null;
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  isDefaultCity: boolean;
}) {
  const [air, setAir] = useState<AirQuality | null>(null);
  const [airError, setAirError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [planError, setPlanError] = useState("");
  const [generating, setGenerating] = useState(false);

  const cityId = city?.id;
  const loadingAir = !!city && !air && !airError;

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
  }, [cityId, attempt]);

  function refresh() {
    setAir(null);
    setAirError("");
    setPlan(null);
    setPlanError("");
    setAttempt((v) => v + 1);
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

  async function handleCreatePlan(e: FormEvent) {
    e.preventDefault();
    if (!city || loadingAir || generating) return;
    if (!profile.members.length) {
      setPlanError("Please select at least one household member.");
      return;
    }
    setGenerating(true);
    setPlanError("");
    setPlan(null);
    try {
      const result = await requestJson<{ air: AirQuality; plan: Plan }>("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityId: city.id, profile }),
      });
      if (result.air.city.id !== city.id) throw new Error("The plan response did not match the selected city.");
      setAir(result.air);
      setAirError("");
      setPlan(result.plan);
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : "An action plan could not be generated.");
    } finally {
      setGenerating(false);
    }
  }

  if (!city) {
    return (
      <div className="city-empty-panel">
        <div className="empty-inner">
          <Wind size={36} className="empty-icon" aria-hidden="true" />
          <h2 className="empty-heading">Select an Indian city or territory to begin</h2>
          <p className="empty-copy">
Search for a city above to see nearby station readings, model estimates, and an action plan for your household.
          </p>

        </div>
      </div>
    );
  }

  return (
    <>
      <div className="cockpit-grid">
        {/* SECTION 1: Air quality near you (Left Column on Desktop, Top on Mobile) */}
        <section className="panel-station-block" aria-labelledby="heading-air-quality">
          <div className="section-title-bar">
            <div>
              <h2 id="heading-air-quality" className="panel-title">
                Air quality near you
              </h2>
              <div className="city-headline-row">
                <span className="city-location-name">{city.name}</span>
                {isDefaultCity && <span className="city-default-badge">Default city</span>}
                <span className="city-location-region">
                  {[city.locality, city.region, "India"].filter(Boolean).join(", ")}
                </span>
              </div>
            </div>

            <button
              type="button"
              className={`btn-refresh-readings ${loadingAir ? "is-spinning" : ""}`}
              onClick={refresh}
              disabled={loadingAir || generating}
              aria-label="Refresh air quality readings"
              title="Refresh readings"
            >
              <RotateCw size={16} aria-hidden="true" />
              <span className="refresh-label">Refresh</span>
            </button>
          </div>

          {/* Error Message */}
          {airError && (
            <div className="error-alert" role="alert">
              <AlertTriangle size={18} aria-hidden="true" />
              <div>
                <strong>Could not load air quality data:</strong> {airError}
                <div>
                  <button type="button" className="btn-retry-inline" onClick={refresh} disabled={generating}>
                    <RotateCw size={13} aria-hidden="true" /> Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Shimmer */}
          {loadingAir && !air && (
            <div className="telemetry-loading-card" role="status">
              <div className="telemetry-spinner" aria-hidden="true" />
              <div className="loading-text-main">Loading outdoor readings for {city.name}…</div>
              <div className="loading-text-sub">Checking OpenAQ station readings and Open-Meteo model estimates</div>
            </div>
          )}

          {/* Telemetry Streams */}
          {air && (
            <div className="telemetry-streams-container">
              {/* Nearby station readings (OpenAQ) */}
              <StreamCard kind="measured" data={air.measured} />

              {/* Model estimates (Open-Meteo / Copernicus CAMS) */}
              <StreamCard kind="modeled" data={air.modeled} />
            </div>
          )}

          {/* Transparency Disclaimer */}
          <div className="telemetry-scientific-note">
            <strong>Transparency Notice:</strong> Station readings come from outdoor monitors within 25 km of the city centre. Conditions can vary across the city. CAMS provides separate outdoor estimates on a global grid of about 45 km over India.
          </div>
        </section>

        {/* SECTION 2: Your household (Right Column on Desktop) */}
        <section className="panel-household-block" aria-labelledby="heading-household">
          <div className="section-title-bar">
            <div>
              <h2 id="heading-household" className="panel-title">
                Your household
              </h2>
              <p className="panel-subtitle">
                Choose who is in your household and how you travel.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreatePlan} className="household-form">
            <fieldset
              aria-describedby={planError && !profile.members.length ? "plan-error-msg" : undefined}
              className="household-fieldset"
            >
              <legend className="fieldset-legend">
                Household members (select all that apply):
              </legend>

              <div className="member-selection-grid">
                <MemberCard
                  id="children"
                  label="Children"
                    icon={Baby}
                  selected={profile.members.includes("Children")}
                  onToggle={() => toggleMember("Children")}
                  disabled={generating}
                />
                <MemberCard
                  id="older-adults"
                  label="Older adults"
                    icon={User}
                  selected={profile.members.includes("Older adults")}
                  onToggle={() => toggleMember("Older adults")}
                  disabled={generating}
                />
                <MemberCard
                  id="working-adults"
                  label="Working adults"
                    icon={Briefcase}
                  selected={profile.members.includes("Working adults")}
                  onToggle={() => toggleMember("Working adults")}
                  disabled={generating}
                />
                <MemberCard
                  id="students"
                  label="Students"
                    icon={GraduationCap}
                  selected={profile.members.includes("Students")}
                  onToggle={() => toggleMember("Students")}
                  disabled={generating}
                />
              </div>
            </fieldset>

            {/* Commute and Priority Controls */}
            <div className="household-dropdowns-grid">
              <div className="form-field-group">
                <label htmlFor="commute-select" className="dropdown-label">
                  <Car size={15} aria-hidden="true" />
                  <span>Typical commute</span>
                </label>
                <select
                  id="commute-select"
                  className="dropdown-select-control"
                  value={profile.commute}
                  disabled={generating}
                  onChange={(e) => updateCommute(e.target.value as Profile["commute"])}
                >
                  {commutes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field-group">
                <label htmlFor="priority-select" className="dropdown-label">
                  <Compass size={15} aria-hidden="true" />
                  <span>What matters today?</span>
                </label>
                <select
                  id="priority-select"
                  className="dropdown-select-control"
                  value={profile.priority}
                  disabled={generating}
                  onChange={(e) => updatePriority(e.target.value as Profile["priority"])}
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Profile Summary */}
            <div className="active-summary-strip" aria-label="Selected household configuration">
              <span className="summary-title">Selected profile:</span>
              {profile.members.length > 0 ? (
                profile.members.map((m) => (
                  <span key={m} className="summary-tag">
                    {m}
                  </span>
                ))
              ) : (
                <span className="summary-empty-warning">No members selected (select at least one)</span>
              )}
              <span className="summary-tag muted">Commute: {profile.commute}</span>
              <span className="summary-tag muted">Priority: {profile.priority}</span>
            </div>

            {/* CTA Generate Button */}
            <div className="cta-container">
              <button
                type="submit"
                className="btn-create-plan"
                disabled={generating || loadingAir || profile.members.length === 0}
                aria-describedby="plan-privacy-note"
              >
                <span>{generating ? "Crafting plan with Gemini…" : "Generate action plan"}</span>
              </button>
              <p id="plan-privacy-note" className="privacy-micro-copy">
                Household choices and available recent outdoor readings are sent to Google Gemini only when you request a plan.
              </p>
            </div>

            {planError && (
              <div id="plan-error-msg" className="error-alert" role="alert" style={{ marginTop: "14px" }}>
                <AlertTriangle size={18} aria-hidden="true" />
                <div>
                  <strong>Action plan error:</strong> {planError}
                </div>
              </div>
            )}
          </form>
        </section>
      </div>

      {/* Plan Generating State */}
      {generating && (
        <div className="telemetry-loading-card" role="status" style={{ marginTop: "20px" }}>
          <div className="telemetry-spinner" aria-hidden="true" />
          <div className="loading-text-main">Synthesizing personalized action plan for {city.name}…</div>
          <div className="loading-text-sub">Gemini is selecting vetted actions using your household choices and available recent outdoor readings.</div>
        </div>
      )}

      {/* SECTION 3: Your action plan (Full Width) */}
      <p className="sr-only" role="status">{plan ? "Your personalized action plan is displayed below." : ""}</p>
      {plan && <PlanView plan={plan} />}
    </>
  );
}

function MemberCard({
  id,
  label,
  icon: Icon,
  selected,
  onToggle,
  disabled,
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ size: number; ariaHidden?: boolean; className?: string }>;
  selected: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <button
      id={`member-${id}`}
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-labelledby={`member-${id}-label`}
      className={`member-card-button ${selected ? "is-selected" : ""}`}
      onClick={onToggle}
      disabled={disabled}
    >
      <div className="member-check-box" aria-hidden="true">
        {selected && <Check size={12} strokeWidth={3} />}
      </div>
      <div className="member-card-content">
        <div className="member-icon-wrap" aria-hidden="true">
          <Icon size={18} />
        </div>
        <div>
          <span id={`member-${id}-label`} className="member-card-name">
            {label}
          </span>
        </div>
      </div>
    </button>
  );
}

function StreamCard({ kind, data }: { kind: "measured" | "modeled"; data: DataSource }) {
  const isMeasured = kind === "measured";
  const Icon = isMeasured ? Radio : Layers3;

  const statusMessages: Record<DataSource["status"], string> = {
    available: "",
    "no-data": isMeasured
      ? "No usable station readings found within 25 km of the city centre."
      : "No usable modeled estimates were returned for this location.",
    unavailable: isMeasured
      ? "OpenAQ API is temporarily unavailable."
      : "Open-Meteo atmospheric forecast service is temporarily unavailable.",
    unconfigured: "Station observations are unavailable until the server is configured for OpenAQ.",
    partial: "Some nearby station sensors could not be verified. Valid readings shown below.",
  };

  const message = statusMessages[data.status];

  return (
    <article className={`telemetry-stream-card ${isMeasured ? "stream-station" : "stream-model"}`}>
      <div className="stream-card-masthead">
        <div className="stream-badge-group">
          <Icon size={16} className="stream-type-icon" aria-hidden="true" />
          <h3 className="stream-card-title">
            {isMeasured ? "Nearby station readings" : "Model estimates"}
          </h3>
        </div>
        <span className={`stream-source-tag ${isMeasured ? "tag-openaq" : "tag-openmeteo"}`}>
          {isMeasured ? "OpenAQ Ground Station" : "Open-Meteo / Copernicus CAMS"}
        </span>
      </div>

      {message && (
        <p className="stream-notice-box">
          {message}
        </p>
      )}

      {/* Numerical Telemetry Values */}
      <div className="readings-grid">
        {pollutants.map((pollutant) => {
          const reading = data.readings.find((r) => r.pollutant === pollutant);
          return (
            <div key={pollutant} className="pollutant-reading-cell">
              <div className="pollutant-label">{pollutantNames[pollutant]}</div>
              {reading ? (
                <>
                  <div className="pollutant-number-wrap">
                    <span className="pollutant-number">{reading.value}</span>
                    <span className="pollutant-unit">{reading.unit}</span>
                  </div>
                  <div className="pollutant-freshness-row">
                    <span className={`freshness-badge ${reading.freshness}`}>
                      {states[reading.freshness]}
                    </span>
                  </div>
                  {isMeasured && (
                    <div className="pollutant-provenance-meta">
                      <time dateTime={reading.timestamp}>
                        Observed: {date.format(new Date(reading.timestamp))} IST
                      </time>
                      {reading.station && (
                        <div className="station-meta-line">
                          {reading.station.name} · {reading.station.provider} · {reading.station.distanceKm.toFixed(1)} km from centre
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="pollutant-unavailable">
                  Unavailable
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stream Provenance Footer */}
      <div className="stream-card-footer">
        {isMeasured ? (
          <div className="footer-meta-text">
            Physical ground observation via OpenAQ API v3 within 25 km radius
          </div>
        ) : (
          <div className="model-footer-meta">
            <div className="model-disclaimer-text">
              Copernicus Atmosphere Monitoring Service (CAMS) global atmospheric model estimates via Open-Meteo. These are regional numerical simulations, not ground monitor measurements.
            </div>
            {data.readings[0]?.timestamp && (
              <div className="model-time-stamp">
                <Clock size={13} aria-hidden="true" />
                <time dateTime={data.readings[0].timestamp}>
                  Model validity: {date.format(new Date(data.readings[0].timestamp))} IST
                </time>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function PlanView({ plan }: { plan: Plan }) {
  const fromGemini = plan.source === "gemini";
  const isFallback = plan.source === "fallback";
  const grounded = fromGemini && plan.basis !== "limited";

  const cards = [
    {
      category: "Daily routine",
      tag: "Outdoor activity",
      icon: Activity,
      type: "routine" as const,
      action: plan.actions.routine,
    },
    {
      category: "Indoor air",
      tag: "Indoor environment",
      icon: House,
      type: "indoor" as const,
      action: plan.actions.indoor,
    },
    {
      category: "Travel and commute",
      tag: "Lower-emission travel",
      icon: Bus,
      type: "travel" as const,
      action: plan.actions.travel,
    },
  ];

  return (
    <section className="panel-action-plan-block" aria-labelledby="heading-action-plan">
      <div className="section-title-bar">
        <div>
          <h2 id="heading-action-plan" className="panel-title">
            Your action plan
          </h2>
          <p className="panel-subtitle">
            {fromGemini ? "Actions selected by Google Gemini" : "General household guidance"}
          </p>
        </div>
      </div>

      {/* Provenance Grounding Banner */}
      <div className="plan-provenance-banner">
        <div className="provenance-info-row">
          <Info size={16} aria-hidden="true" className="provenance-info-icon" />
          <span className="provenance-basis-text">
            {fromGemini
              ? planBasis[plan.basis]
              : isFallback ? "Fallback guidance. Gemini did not select these actions." : "Plan source is unavailable."}
          </span>
        </div>
        {fromGemini && <span className="plan-provenance-tag gemini-tag">Live Gemini Inference</span>}
      </div>

      {/* Recommendation Action Cards Grid */}
      <div className="plan-cards-grid">
        {cards.map(({ category, tag, icon: Icon, type, action }) => (
          <article key={category} className={`action-card-item card-${type}`}>
            <div className="card-top-head">
              <div className="category-meta-wrap">
                <Icon size={17} className="category-icon" aria-hidden="true" />
                <h3 className="category-title">{category}</h3>
              </div>
              <span className="category-tag">{tag}{grounded ? " · Gemini Grounded" : ""}</span>
            </div>

            <h4 className="action-main-title">{action.title}</h4>

            <div className="action-why-block">
              <span className="why-label">Why this matters:</span>
              <p className="why-explanation">{action.why}</p>
            </div>
          </article>
        ))}
      </div>

      {/* Scientific Disclaimer */}
      <div className="plan-sensor-disclaimer">
        Indoor advice is general. A separate indoor sensor is needed to measure indoor air quality.
      </div>
    </section>
  );
}

function AboutDataView() {
  return (
    <section className="edu-view-block" aria-labelledby="heading-about-data">
      <div className="section-title-bar">
        <div>
          <h2 id="heading-about-data" className="panel-title">
            About the data
          </h2>
          <p className="panel-subtitle">
            Scientific data sources, physical monitoring radii, and atmospheric composition models.
          </p>
        </div>
      </div>

      <div className="edu-cards-grid">
        <article className="edu-article-card station-border">
          <h3 className="edu-card-title">
            <Radio size={16} className="edu-icon station" aria-hidden="true" />
            Nearby station readings (OpenAQ API v3)
          </h3>
          <p className="edu-card-text">
            Observations originate from ground-level physical monitors indexed by the OpenAQ global repository. Each station observation reflects physical measurement instruments operated by governmental and academic networks (such as CPCB, DPCC, IITM, and state pollution control boards).
          </p>
          <ul className="edu-bullet-list">
            <li><strong>Monitoring Radius:</strong> Searches for ground stations within 25 km of the selected city centre.</li>
            <li><strong>Parameters:</strong> Physical PM2.5 and PM10 concentrations reported directly by the monitor in µg/m³.</li>
            <li><strong>Data Freshness:</strong> Categorized as Recent (≤ 3 hours), Delayed (over 3 and up to 24 hours), or Stale (&gt; 24 hours).</li>
          </ul>
        </article>

        <article className="edu-article-card model-border">
          <h3 className="edu-card-title">
            <Layers3 size={16} className="edu-icon model" aria-hidden="true" />
            Model estimates (Open-Meteo / Copernicus CAMS)
          </h3>
          <p className="edu-card-text">
            VayuSaathi displays CAMS estimates from Open-Meteo alongside any available station readings.
          </p>
          <ul className="edu-bullet-list">
            <li><strong>Spatial Resolution:</strong> Approximately 45 km horizontal grid resolution for the global atmospheric composition model over India.</li>
            <li><strong>Methodology:</strong> Integrates satellite observations with numerical chemical transport forecasting and meteorological models.</li>
            <li><strong>Scientific Role:</strong> Fills critical geographical coverage gaps across smaller Indian towns without misrepresenting modeled values as physical station readings.</li>
          </ul>
        </article>

        <article className="edu-article-card">
          <h3 className="edu-card-title">
            <Clock size={16} className="edu-icon" aria-hidden="true" />
            Timestamps and Indian Standard Time (IST)
          </h3>
          <p className="edu-card-text">
            Times are shown in Indian Standard Time (IST). Observation time is the timestamp reported for the station reading. Model validity time is when the estimate applies.
          </p>
        </article>

        <article className="edu-article-card">
          <h3 className="edu-card-title">
            <ShieldCheck size={16} className="edu-icon" aria-hidden="true" />
            Concentrations and AQI
          </h3>
          <p className="edu-card-text">
            VayuSaathi shows outdoor particle concentrations in µg/m³. A displayed reading does not establish an AQI category or a safe exposure level.
          </p>
        </article>
      </div>
    </section>
  );
}

function HealthSafetyView() {
  return (
    <section className="edu-view-block" aria-labelledby="heading-health-safety">
      <div className="section-title-bar">
        <div>
          <h2 id="heading-health-safety" className="panel-title">
            Health & safety guide
          </h2>
          <p className="panel-subtitle">
            General guidance on particles in outdoor and indoor air.
          </p>
        </div>
      </div>

      <div className="edu-cards-grid">
        <article className="edu-article-card">
          <h3 className="edu-card-title">
            <Wind size={16} className="edu-icon" aria-hidden="true" />
            What PM2.5 and PM10 mean
          </h3>
          <p className="edu-card-text">
            <strong>PM2.5</strong> describes fine particles about 2.5 micrometers across or smaller. <strong>PM10</strong> includes particles up to 10 micrometers, including PM2.5. Fine particles can reach deep into the lungs.
          </p>
          <ul className="edu-bullet-list">
            <li>Sources include vehicle exhaust, dust from construction and roads, and smoke.</li>
            <li>Check local advisories before planning outdoor activities.</li>
          </ul>
        </article>

        <article className="edu-article-card">
          <h3 className="edu-card-title">
            <User size={16} className="edu-icon" aria-hidden="true" />
            Sensitive and vulnerable groups
          </h3>
          <p className="edu-card-text">
            Children, older adults, and people with heart or lung conditions may be more affected by particle pollution. Follow local public-health advisories.
          </p>
        </article>

        <article className="edu-article-card">
          <h3 className="edu-card-title">
            <House size={16} className="edu-icon" aria-hidden="true" />
            Indoor air quality protection
          </h3>
          <p className="edu-card-text">
            Outdoor particles can enter buildings. Cooking and other indoor sources can also affect indoor air.
          </p>
          <ul className="edu-bullet-list">
            <li>Use a kitchen exhaust fan that vents outdoors if available.</li>
            <li>Reduce avoidable indoor smoke from sources such as incense, candles, and tobacco.</li>
            <li>If you use a portable air cleaner, follow the manufacturer’s guidance and replace its filter as directed.</li>
          </ul>
        </article>

        <article className="edu-article-card">
          <h3 className="edu-card-title">
            <Footprints size={16} className="edu-icon" aria-hidden="true" />
            Low-emission travel and commute habits
          </h3>
          <p className="edu-card-text">
            Combining errands or sharing a ride can reduce the number of separate vehicle trips.
          </p>
          <ul className="edu-bullet-list">
            <li>Check local advisories when planning outdoor travel.</li>
            <li>Switch off the engine when safely parked and waiting.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
