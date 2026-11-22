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
  Sparkles,
  User,
  Users,
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
  { name: "Delhi", query: "Delhi" },
  { name: "Mumbai", query: "Mumbai" },
  { name: "Kolkata", query: "Kolkata" },
  { name: "Bengaluru", query: "Bengaluru" },
  { name: "Hyderabad", query: "Hyderabad" },
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
  { id: "recommendations", label: "Recommendations & Air Quality", icon: Sparkles },
  { id: "about-data", label: "About the Data", icon: Info },
  { id: "health-safety", label: "Health & Safety Guide", icon: ShieldCheck },
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
    const tab = tabs[position].id;
    setActiveTab(tab);
    document.getElementById("tab-" + tab)?.focus();
  }

  // Initial default: load Delhi so the user immediately sees a live, functional experience
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const result = await requestJson<{ cities: City[] }>("/api/cities?q=Delhi", { signal: controller.signal });
        if (!controller.signal.aborted && !userChoseSearch.current && result.cities.length > 0) {
          setCity(result.cities[0]);
        }
      } catch {
        // Ignore initial prefill failure
      }
    })();
    return () => controller.abort();
  }, []);

  async function search(term: string, notice = "") {
    const trimmed = term.trim();
    if (trimmed.length < 2) return;
    userChoseSearch.current = true;
    setQuery(trimmed);
    setSearchError("");
    setLocationNotice(notice);
    setMatches(null);
    setSearchStatus("loading");
    try {
      const result = await requestJson<{ cities: City[] }>("/api/cities?q=" + encodeURIComponent(trimmed));
      setMatches(result.cities);
      if (result.cities.length === 1) {
        chooseCity(result.cities[0]);
        setMatches(null);
      }
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "City search failed. Try again.");
    } finally {
      setSearchStatus("idle");
    }
  }

  function handleUseLocation() {
    setLocationNotice("");
    if (!navigator.geolocation) {
      setLocationNotice("Geolocation is not supported by your browser.");
      return;
    }
    userChoseSearch.current = true;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocating(false);
        // Look for a nearby supported metro using coordinates locally.
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        const knownCities = [
          { name: "Delhi", lat: 28.65, lon: 77.22 },
          { name: "Mumbai", lat: 19.07, lon: 72.87 },
          { name: "Kolkata", lat: 22.57, lon: 88.36 },
          { name: "Bengaluru", lat: 12.97, lon: 77.59 },
          { name: "Hyderabad", lat: 17.38, lon: 78.48 },
        ];
        let closest = knownCities[0];
        let minDist = Infinity;
        for (const c of knownCities) {
          const radians = Math.PI / 180;
          const latitude = (c.lat + coords.lat) / 2 * radians;
          const d = 6371 * radians * Math.hypot(c.lat - coords.lat, (c.lon - coords.lon) * Math.cos(latitude));
          if (d < minDist) {
            minDist = d;
            closest = c;
          }
        }
        if (minDist > 50) {
          setLocationNotice("No supported metro is near your location. Search for your city instead.");
          return;
        }
        await search(closest.name, "Nearby supported metro: " + closest.name + ". Results are for the selected city.");
      },
      () => {
        setLocating(false);
        setLocationNotice("Could not get your location. Search for your city instead.");
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
    <>
      {/* Hero & Search Header */}
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-art-backdrop" aria-hidden="true" />
        <div className="shell hero-content">
          <div className="hero-badge">
            <Sparkles size={14} aria-hidden="true" />
            <span>GenAI Urban Air Quality Assistant</span>
          </div>
          <h1 id="hero-title" className="hero-title">
            Breathe Better, Live Healthier
          </h1>
          <p className="hero-subtitle">
            Real air quality, personalized guidance for you and your family across Indian cities.
          </p>

          {/* Search Box */}
          <div className="search-container">
            <form
              className="search-box"
              onSubmit={(e) => {
                e.preventDefault();
                if (!searching && !locating) void search(query);
              }}
            >
              <label htmlFor="city-query" className="sr-only">
                Search Indian city
              </label>
              <MapPin size={22} className="search-icon-lead" aria-hidden="true" />
              <input
                id="city-query"
                ref={searchInput}
                aria-describedby={searchError ? "city-search-error" : undefined}
                type="search"
                className="search-input-field"
                value={query}
                placeholder="Search Indian city (e.g. Delhi, Mumbai, Bengaluru)"
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
                  className="clear-btn"
                  onClick={clearSearch}
                  disabled={searching || locating}
                  aria-label="Clear city search query"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              )}
              <button
                type="submit"
                className="search-submit-btn"
                disabled={searching || locating || query.trim().length < 2}
              >
                <Search size={18} aria-hidden="true" />
                <span>{searching ? "Searching…" : "Search"}</span>
              </button>
              <button
                type="button"
                className="location-btn"
                onClick={handleUseLocation}
                disabled={locating || searching}
              >
                <LocateFixed size={18} aria-hidden="true" />
                <span>{locating ? "Locating…" : "Use my location"}</span>
              </button>
            </form>

            {/* Quick-Select Shortcuts */}
            <div className="quick-shortcuts" role="group" aria-label="Popular city quick searches">
              <span className="quick-label">Popular:</span>
              {popularCities.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  className={`city-chip ${city?.name.toLowerCase() === item.name.toLowerCase() ? "active" : ""}`}
                  disabled={searching || locating}
                  onClick={() => void search(item.query)}
                >
                  {item.name}
                </button>
              ))}
            </div>

            {/* Location Notice / Feedback */}
            {locationNotice && (
              <p className="status-message" role="status" style={{ marginTop: "10px", fontSize: "0.85rem", color: "var(--primary-dark)" }}>
                {locationNotice}
              </p>
            )}

            {/* Search Error */}
            {searchError && (
              <div id="city-search-error" className="error-alert" role="alert">
                <AlertTriangle size={20} aria-hidden="true" />
                <div>
                  <strong>City search failed</strong>
                  <p>{searchError}</p>
                </div>
              </div>
            )}

            {/* City Disambiguation Results */}
            {matches && matches.length > 0 && (
              <div className="search-results-card" role="region" aria-label="City search matches">
                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--muted)", margin: "4px 8px 8px" }}>
                  Select your exact location from {matches.length} matching Indian locations:
                </p>
                <ul className="search-results-list">
                  {matches.map((item) => {
                    const isSelected = item.id === city?.id;
                    return (
                      <li key={item.id} className="search-result-item">
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => {
                            chooseCity(item);
                            setMatches(null);
                            searchInput.current?.focus();
                          }}
                        >
                          <div className="result-main">
                            <MapPin size={18} className="result-pin" aria-hidden="true" />
                            <div>
                              <div className="result-name">{item.name}</div>
                              <div className="result-location">
                                {item.region ?? "State or territory unavailable"}
                                {item.locality && " · " + item.locality}
                              </div>
                            </div>
                          </div>
                          {isSelected ? (
                            <span className="result-badge">Selected ✓</span>
                          ) : (
                            <ArrowRight size={17} color="var(--muted)" aria-hidden="true" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {matches && matches.length === 0 && (
              <p className="status-message" role="status" style={{ marginTop: "10px", color: "var(--muted)" }}>
                No matching Indian locations found. Try checking the spelling or search for a nearby district.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Dashboard Body */}
      <div className="shell" style={{ marginTop: "28px" }}>
        <div className="dashboard-tabs" role="tablist" aria-label="Dashboard views">
          {tabs.map(({ id, label, icon: Icon }, index) => (
            <button
              key={id}
              id={"tab-" + id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              aria-controls={"view-" + id}
              tabIndex={activeTab === id ? 0 : -1}
              className={activeTab === id ? "tab-btn active" : "tab-btn"}
              onClick={() => setActiveTab(id)}
              onKeyDown={(event) => navigateTabs(event, index)}
            >
              <Icon size={17} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div id="view-recommendations" role="tabpanel" aria-labelledby="tab-recommendations" tabIndex={0} hidden={activeTab !== "recommendations"}>
          <CityAirView key={city?.id ?? "empty"} city={city} profile={profile} setProfile={setProfile} />
        </div>
        <div id="view-about-data" role="tabpanel" aria-labelledby="tab-about-data" tabIndex={0} hidden={activeTab !== "about-data"}>
          <AboutDataView />
        </div>
        <div id="view-health-safety" role="tabpanel" aria-labelledby="tab-health-safety" tabIndex={0} hidden={activeTab !== "health-safety"}>
          <HealthSafetyView />
        </div>
      </div>
    </>
  );
}

function CityAirView({
  city,
  profile,
  setProfile,
}: {
  city: City | null;
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
}) {
  const [air, setAir] = useState<AirQuality | null>(null);
  const [airError, setAirError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [planError, setPlanError] = useState("");
  const [generating, setGenerating] = useState(false);

  const cityId = city?.id;
  const loadingAir = !!city && !air && !airError;

  // Fetch air quality whenever city changes or refresh is clicked
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
          setAirError(err.message || "Failed to load air quality data.");
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
      setPlanError(err instanceof Error ? err.message : "An AI plan could not be generated.");
    } finally {
      setGenerating(false);
    }
  }

  if (!city) {
    return (
      <div className="empty-state-box">
        <Wind size={42} aria-hidden="true" color="var(--primary)" style={{ margin: "0 auto 12px" }} />
        <h2 style={{ fontSize: "1.2rem", fontWeight: 750, color: "var(--ink)" }}>Choose a city to begin</h2>
        <p>Search for any Indian city or territory to explore live station observations, atmospheric estimates, and tailored AI plans.</p>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard-main-grid">
        {/* City Status & Dual-Stream Panel (Left Column) */}
        <section className="panel" aria-labelledby="city-readings-heading">
        <div className="city-header-bar">
          <div className="city-title-group">
            <span className="city-pin-badge" aria-hidden="true">
              <MapPin size={22} />
            </span>
            <div>
              <h2 id="city-readings-heading" className="city-name">
                {city.name}
              </h2>
              <div className="city-meta">
                {[city.locality, city.region, "India"].filter(Boolean).join(", ")}
              </div>
            </div>
          </div>

          <div className="city-actions">
            <button
              type="button"
              className={`refresh-btn ${loadingAir ? "spinning" : ""}`}
              onClick={refresh}
              disabled={loadingAir || generating}
              aria-label="Refresh air quality readings"
              title="Refresh readings"
            >
              <RotateCw size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Air Quality Error Alert */}
        {airError && (
          <div className="error-alert" role="alert">
            <AlertTriangle size={20} aria-hidden="true" />
            <div>
              <h3>Could not load air quality data</h3>
              <p>{airError}</p>
              <button type="button" className="retry-btn" onClick={refresh} disabled={generating}>
                <RotateCw size={14} aria-hidden="true" /> Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loadingAir && !air && (
          <div className="loading-state-card" role="status">
            <div className="spinner" aria-hidden="true" />
            <p style={{ fontWeight: 700, color: "var(--ink)", margin: 0 }}>
              Fetching latest air quality for {city.name}…
            </p>
            <p style={{ fontSize: "0.84rem", color: "var(--muted)", margin: "4px 0 0" }}>
              Checking nearby OpenAQ ground stations and Open-Meteo CAMS models.
            </p>
          </div>
        )}

        {/* Air Streams Grid */}
        {air && (
          <div className="air-streams-grid">
            {/* Stream A: Station Observations (OpenAQ) */}
            <StreamCard kind="measured" data={air.measured} />

            {/* Stream B: Modeled Estimates (Open-Meteo) */}
            <StreamCard kind="modeled" data={air.modeled} />
          </div>
        )}

        {/* Scientific Footnote */}
        <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "14px 0 0", lineHeight: 1.45 }}>
          <strong>Transparency Notice:</strong> Measurements are displayed in µg/m³. Station observations reflect ground-level physical monitors within 25 km. Modeled values represent Copernicus Atmosphere Monitoring Service (CAMS) regional estimates.
        </p>
      </section>

      {/* Interactive Household Personalization Section */}
      <section className="household-section" aria-labelledby="household-heading">
        <div className="section-head">
          <span className="section-icon-lead">
            <Users size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 id="household-heading" className="section-title">
              Personalized Plan for Your Household
            </h2>
            <p className="section-desc">
              Select who is in your home so Gemini can tailor your daily schedule, indoor precautions, and commute.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreatePlan}>
          {/* Member Selection Cards */}
          <fieldset aria-describedby={planError && !profile.members.length ? "plan-error" : undefined} style={{ border: "none", padding: 0, margin: 0 }}>
            <legend className="field-label" style={{ marginBottom: "12px" }}>
              Who lives in your household? (Select all that apply)
            </legend>
            <div className="member-cards-grid">
              <MemberCard
                id="children"
                label="Children"
                sub="Under 14 years"
                icon={Baby}
                selected={profile.members.includes("Children")}
                onToggle={() => toggleMember("Children")}
                disabled={generating}
              />
              <MemberCard
                id="older-adults"
                label="Older Adults"
                sub="Ages 60+"
                icon={User}
                selected={profile.members.includes("Older adults")}
                onToggle={() => toggleMember("Older adults")}
                disabled={generating}
              />
              <MemberCard
                id="working-adults"
                label="Working Adults"
                sub="Office / field commute"
                icon={Briefcase}
                selected={profile.members.includes("Working adults")}
                onToggle={() => toggleMember("Working adults")}
                disabled={generating}
              />
              <MemberCard
                id="students"
                label="Students"
                sub="School / college travel"
                icon={GraduationCap}
                selected={profile.members.includes("Students")}
                onToggle={() => toggleMember("Students")}
                disabled={generating}
              />
            </div>
          </fieldset>

          {/* Commute and Priority Selects */}
          <div className="profile-selects-row">
            <div className="field-group">
              <label htmlFor="commute-select" className="field-label">
                <Car size={16} aria-hidden="true" />
                <span>Typical commute</span>
              </label>
              <select
                id="commute-select"
                className="select-control"
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

            <div className="field-group">
              <label htmlFor="priority-select" className="field-label">
                <Compass size={16} aria-hidden="true" />
                <span>What matters today?</span>
              </label>
              <select
                id="priority-select"
                className="select-control"
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

          {/* Active Profile Summary Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--muted)" }}>Current Focus:</span>
            {profile.members.map((m) => (
              <span key={m} className="genai-badge" style={{ fontSize: "0.76rem" }}>
                ✓ {m}
              </span>
            ))}
            <span className="genai-badge" style={{ fontSize: "0.76rem", background: "#f5f3ff", borderColor: "#ddd6fe", color: "#6d28d9" }}>
              Commute: {profile.commute}
            </span>
            <span className="genai-badge" style={{ fontSize: "0.76rem", background: "#fef3c7", borderColor: "#fde68a", color: "#b45309" }}>
              Priority: {profile.priority}
            </span>
          </div>

          {/* Generate Button & Error Feedback */}
          <div className="plan-generate-row">
            <button
              type="submit"
              className="plan-cta-btn"
              disabled={generating || loadingAir}
              aria-describedby="plan-input-note"
            >
              <Sparkles size={18} aria-hidden="true" />
              <span>{generating ? "Crafting Your Plan with Gemini…" : "Create My Personalized Plan"}</span>
            </button>
            <p id="plan-input-note" style={{ fontSize: "0.82rem", color: "var(--muted)", margin: 0 }}>
              Household choices and available recent outdoor readings are sent to Gemini when you request a plan.
            </p>
          </div>

          {planError && (
            <div id="plan-error" className="error-alert" role="alert" style={{ marginTop: "16px" }}>
              <AlertTriangle size={20} aria-hidden="true" />
              <div>
                <h3>Could not generate plan</h3>
                <p>{planError}</p>
              </div>
            </div>
          )}
        </form>
      </section>
      </div>

      {/* Plan Generating Shimmer */}
      {generating && (
        <div className="loading-state-card" role="status">
          <div className="spinner" aria-hidden="true" />
          <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--ink)", margin: "0 0 6px" }}>
            Creating your plan…
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0, maxWidth: "52ch" }}>
Gemini is choosing vetted actions for {city.name} based on your household and available recent data.
          </p>
        </div>
      )}

      {/* Generated Recommendations View */}
      <p className="sr-only" role="status">{plan ? "Your personalized plan is ready below." : ""}</p>
      {plan && <PlanView plan={plan} />}
    </>
  );
}

function MemberCard({
  id,
  label,
  sub,
  icon: Icon,
  selected,
  onToggle,
  disabled,
}: {
  id: string;
  label: string;
  sub: string;
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
      aria-describedby={`member-${id}-description`}
      className={`member-toggle-card ${selected ? "selected" : ""}`}
      onClick={onToggle}
      disabled={disabled}
    >
      {selected && (
        <span className="member-check-badge" aria-hidden="true">
          <Check size={13} strokeWidth={3} />
        </span>
      )}
      <div className="member-avatar-wrap">
        <Icon size={24} aria-hidden="true" />
      </div>
      <span id={`member-${id}-label`} className="member-label">{label}</span>
      <span id={`member-${id}-description`} className="member-sub">{sub}</span>
    </button>
  );
}

function StreamCard({ kind, data }: { kind: "measured" | "modeled"; data: DataSource }) {
  const isMeasured = kind === "measured";
  const Icon = isMeasured ? Radio : Layers3;

  const statusMessages: Record<DataSource["status"], string> = {
    available: "",
    "no-data": isMeasured
      ? "No usable station readings found within 25 km of the city center."
      : "No usable modeled estimates were returned for this location.",
    unavailable: isMeasured
      ? "OpenAQ API is temporarily unavailable."
      : "Open-Meteo atmospheric forecast service is temporarily unavailable.",
    unconfigured: "Station observations are unavailable until the server is configured for OpenAQ.",
    partial: "Some nearby station sensors could not be verified. Valid readings shown below.",
  };

  const message = statusMessages[data.status];

  return (
    <div className={`stream-card ${isMeasured ? "station" : "modeled"}`}>
      <div>
        <div className="stream-header">
          <div className="stream-title">
            <Icon size={18} aria-hidden="true" />
            <span>{isMeasured ? "Monitoring station observation" : "Modeled estimate"}</span>
          </div>
          <span className={`stream-provider-pill ${isMeasured ? "openaq" : "openmeteo"}`}>
            {isMeasured ? "OpenAQ" : "Open-Meteo"}
          </span>
        </div>

        {message && (
          <p style={{ fontSize: "0.84rem", color: "var(--muted)", margin: "0 0 12px", background: "#f0f5f2", padding: "8px 12px", borderRadius: "8px" }}>
            {message}
          </p>
        )}

        {/* Readings Tile Grid */}
        <div className="readings-row">
          {pollutants.map((pollutant) => {
            const reading = data.readings.find((r) => r.pollutant === pollutant);
            return (
              <div key={pollutant} className="reading-tile">
                <div className="reading-pollutant">{pollutantNames[pollutant]}</div>
                {reading ? (
                  <>
                    <div className="reading-value-wrap">
                      <span className="reading-value">{reading.value}</span>
                      <span className="reading-unit">{reading.unit}</span>
                    </div>
                    <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span className={`freshness-pill ${reading.freshness}`}>
                        {states[reading.freshness]}
                      </span>
                    </div>
                    {isMeasured && (
                      <div className="reading-provenance">
                        <time dateTime={reading.timestamp}>Observed: {date.format(new Date(reading.timestamp))} IST</time>
                        {reading.station && <span>{reading.station.name} · {reading.station.provider} · {reading.station.distanceKm.toFixed(1)} km from center</span>}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ fontSize: "0.95rem", color: "var(--muted-light)", fontWeight: 600, padding: "8px 0" }}>
                    Unavailable
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Attribution */}
      <div className="stream-footer">
        {isMeasured ? (
          <div className="stream-meta-line">Ground observations via OpenAQ API v3</div>
        ) : (
          <>
            <div className="stream-meta-line">
              <Layers3 size={14} color="var(--accent)" aria-hidden="true" />
              <span>
                <strong>CAMS (Copernicus)</strong> · Global atmospheric model · ~45 km grid
              </span>
            </div>
            {data.readings[0]?.timestamp && (
              <div className="stream-meta-line">
                <Clock size={13} aria-hidden="true" />
                <time dateTime={data.readings[0].timestamp}>
                  Model validity: {date.format(new Date(data.readings[0].timestamp))} IST
                </time>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PlanView({ plan }: { plan: Plan }) {
  const fromGemini = plan.source === "gemini";
  const grounded = fromGemini && plan.basis !== "limited";
  const cards = [
    {
      category: "Daily Routine",
      tag: "Outdoor & Timing",
      icon: Activity,
      type: "routine" as const,
      action: plan.actions.routine,
    },
    {
      category: "At Home",
      tag: "Indoor Air Safety",
      icon: House,
      type: "indoor" as const,
      action: plan.actions.indoor,
    },
    {
      category: "Travel & Commute",
      tag: "Low-Emission Travel",
      icon: Bus,
      type: "travel" as const,
      action: plan.actions.travel,
    },
  ];

  return (
    <section className="recommendations-panel" aria-labelledby="plan-result-heading">
      <div className="section-head">
        <span className="section-icon-lead" style={{ background: "#ecfdf5", color: "var(--primary)" }}>
          <Sparkles size={20} aria-hidden="true" />
        </span>
        <div>
          <h2 id="plan-result-heading" className="section-title">
            Your Personalized Air Quality Plan
          </h2>
          <p className="section-desc">{fromGemini ? "Actions selected by Google Gemini" : "General household guidance"}</p>
        </div>
      </div>

      {/* Basis Callout */}
      <div className="plan-basis-callout">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Info size={17} aria-hidden="true" style={{ flexShrink: 0 }} />
          <span>{fromGemini ? planBasis[plan.basis] : plan.source === "fallback" ? "Fallback guidance. Gemini did not select these actions." : "Plan source is unavailable."}</span>
        </div>
        {fromGemini && (
          <span className="genai-badge" style={{ fontSize: "0.76rem" }}>
            <Sparkles size={12} aria-hidden="true" />
            <span>Live Gemini Inference</span>
          </span>
        )}
      </div>

      {/* Action Cards */}
      <div className="plan-cards-grid">
        {cards.map(({ category, tag, icon: Icon, type, action }) => (
          <article key={category} className={`plan-card ${type}`}>
            <div>
              <div className="plan-card-header">
                <div className="plan-card-icon">
                  <Icon size={18} aria-hidden="true" />
                </div>
                <div>
                  <h3 style={{ fontSize: "0.98rem", fontWeight: 800, margin: 0, color: "var(--ink)" }}>
                    {category}
                  </h3>
                  <span className="plan-card-tag">{tag}{grounded ? " · Gemini Grounded" : ""}</span>
                </div>
              </div>
              <h4 className="plan-action-title">{action.title}</h4>
            </div>
            <div className="plan-action-why">
              <strong style={{ display: "block", color: "var(--ink)", marginBottom: "3px", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.02em" }}>
                Why this matters:
              </strong>
              {action.why}
            </div>
          </article>
        ))}
      </div>

      {/* Disclaimer */}
      <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: 0, lineHeight: 1.45 }}>
        {fromGemini && "Gemini selects from vetted actions using your household choices and available recent outdoor data. "}Indoor advice is general. A separate indoor sensor is needed to measure indoor air quality.
      </p>
    </section>
  );
}

function AboutDataView() {
  return (
    <section className="edu-content-block" aria-labelledby="about-data-heading">
      <div className="section-head">
        <span className="section-icon-lead">
          <Info size={20} aria-hidden="true" />
        </span>
        <div>
          <h2 id="about-data-heading" className="section-title">
            Understanding VayuSaathi Data Streams
          </h2>
          <p className="section-desc">
            How we combine physical station monitors and chemical transport models with honest provenance.
          </p>
        </div>
      </div>

      <div className="edu-grid">
        <div className="edu-card">
          <h3>
            <Radio size={18} color="var(--primary)" aria-hidden="true" />
            Monitoring Station Observation (OpenAQ)
          </h3>
          <p>
            Observations come from physical outdoor monitors listed by OpenAQ. Each reading identifies its station and data provider.
          </p>
          <ul>
            <li><strong>Coverage:</strong> Scans within a 25 km radius of the selected city center.</li>
            <li><strong>Measurement:</strong> Available PM2.5 and PM10 concentrations reported by the station.</li>
            <li><strong>Freshness:</strong> Recent (≤ 3 hrs), Delayed (≤ 24 hrs), or Stale (&gt; 24 hrs).</li>
          </ul>
        </div>

        <div className="edu-card">
          <h3>
            <Layers3 size={18} color="var(--accent)" aria-hidden="true" />
            Modeled Atmospheric Estimate (Open-Meteo)
          </h3>
          <p>
            VayuSaathi shows Copernicus Atmosphere Monitoring Service (CAMS) estimates via Open-Meteo alongside any available station readings.
          </p>
          <ul>
            <li><strong>Spatial Resolution:</strong> About 45 km for the global atmospheric composition model used in India.</li>
            <li><strong>Mechanism:</strong> Satellite data assimilation with weather and emissions forecasting.</li>
            <li><strong>Role:</strong> Provides continuous regional continuity without replacing ground-truth sensors.</li>
          </ul>
        </div>

        <div className="edu-card">
          <h3>
            <Clock size={18} color="var(--primary)" aria-hidden="true" />
            Timestamps & Timezones
          </h3>
          <p>
            All times are converted to Indian Standard Time (IST, UTC+05:30). Both observation time and model run validity time are explicitly preserved.
          </p>
        </div>

        <div className="edu-card">
          <h3>
            <ShieldCheck size={18} color="var(--primary)" aria-hidden="true" />
            Scientific Accuracy & No Synthetic AQI
          </h3>
          <p>
            VayuSaathi displays genuine pollutant concentrations in µg/m³. Each reading shows its source and time. This dashboard displays concentrations rather than an AQI score.
          </p>
        </div>
      </div>
    </section>
  );
}

function HealthSafetyView() {
  return (
    <section className="edu-content-block" aria-labelledby="health-safety-heading">
      <div className="section-head">
        <span className="section-icon-lead">
          <ShieldCheck size={20} aria-hidden="true" />
        </span>
        <div>
          <h2 id="health-safety-heading" className="section-title">
            Health & Safety Guidelines for Indian Cities
          </h2>
          <p className="section-desc">
            Evidence-based precautions for navigating severe winter smog and urban particulate pollution.
          </p>
        </div>
      </div>

      <div className="edu-grid">
        <div className="edu-card">
          <h3>
            <Wind size={18} color="var(--primary)" aria-hidden="true" />
            PM2.5 vs PM10 Particulate Matter
          </h3>
          <p>
            <strong>PM2.5</strong> describes particles 2.5 micrometers across or smaller. <strong>PM10</strong> includes particles up to 10 micrometers, including PM2.5.
          </p>
          <ul>
            <li>Sources include vehicular exhaust, construction dust, biomass burning, and road dust.</li>
            <li>Check local conditions and advisories before planning outdoor activity.</li>
          </ul>
        </div>

        <div className="edu-card">
          <h3>
            <Users size={18} color="var(--warning)" aria-hidden="true" />
            Sensitive & Vulnerable Groups
          </h3>
          <p>
            Particulate pollution presents elevated risks for specific household demographics:
          </p>
          <ul>
            <li><strong>Children:</strong> Faster respiratory rate and developing lung tissues.</li>
            <li><strong>Older Adults:</strong> Heightened vulnerability to cardiovascular and respiratory stress.</li>
            <li><strong>Outdoor Commuters:</strong> Direct exposure to concentrated roadside exhaust.</li>
          </ul>
        </div>

        <div className="edu-card">
          <h3>
            <House size={18} color="var(--primary)" aria-hidden="true" />
            Indoor Air Quality Protection
          </h3>
          <p>
            Outdoor particles can enter through windows and doors. Indoor levels also depend on cooking, other indoor sources, ventilation and filtration.
          </p>
          <ul>
            <li>Use a kitchen exhaust fan that vents outdoors if available.</li>
            <li>Avoid indoor incense (agarbatti), mosquito coils, and indoor smoking during high pollution days.</li>
            <li>Use HEPA air purifiers in sleeping rooms if available.</li>
          </ul>
        </div>

        <div className="edu-card">
          <h3>
            <Footprints size={18} color="var(--primary)" aria-hidden="true" />
            Low-Emission Travel Habits
          </h3>
          <p>
            Combining errands or sharing a ride can reduce separate vehicle trips.
          </p>
          <ul>
            <li>Check local air-quality advisories when planning outdoor travel.</li>
            <li>Switch off the engine when safely parked and waiting.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
