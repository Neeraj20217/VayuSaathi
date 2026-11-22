"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Activity, ArrowRight, Bus, House, Layers3, MapPin, Radio, Search, Sparkles, Users } from "lucide-react";
import { commutes, members, pollutantNames, pollutants, priorities, type AirQuality, type City, type DataSource, type Plan, type Profile } from "@/lib/contracts";

const cities = ["Delhi", "Mumbai", "Kolkata", "Bengaluru", "Hyderabad"];
const startProfile: Profile = { members: [], commute: "No regular commute", priority: "Flexible errands" };
const date = new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });
const states = { recent: "Recent", delayed: "Delayed", stale: "Stale", future: "Future" };
const planBasis = {
  "recent-station": "Based on recent nearby station measurements.",
  "recent-model": "Based on recent modeled estimates. Recent nearby station measurements were unavailable.",
  limited: "Recent local data was unavailable. Review local advisories before planning outdoor activities.",
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "The request could not be completed.");
  return data as T;
}

export function Dashboard() {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<City[] | null>(null);
  const [city, setCity] = useState<City | null>(null);
  const [searchStatus, setSearchStatus] = useState("idle");
  const [searchError, setSearchError] = useState("");
  const [profile, setProfile] = useState(startProfile);
  const searching = searchStatus === "loading";
  const selectedLocation = city && [city.name, city.region, city.locality].filter(Boolean).join(", ");

  async function search(term: string) {
    setQuery(term);
    setSearchError("");
    setMatches(null);
    setSearchStatus("loading");
    try {
      const result = await requestJson<{ cities: City[] }>("/api/cities?q=" + encodeURIComponent(term.trim()));
      setMatches(result.cities);
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "City search failed.");
    } finally {
      setSearchStatus("idle");
    }
  }

  return (
    <>
      <section className="panel city-panel" aria-labelledby="city-heading">
        <div className="section-heading">
          <span className="section-icon"><MapPin size={20} aria-hidden="true" /></span>
          <div><h2 id="city-heading">Choose your city</h2><p>Search by city name or enter a city and state.</p></div>
        </div>
        <form className="search-form" onSubmit={(event) => { event.preventDefault(); void search(query); }}>
          <label className="sr-only" htmlFor="city-query">Indian city name</label>
          <div className="search-input">
            <Search size={18} aria-hidden="true" />
            <input id="city-query" type="search" value={query} placeholder="Search an Indian city" required minLength={2} maxLength={80}
              readOnly={searching} aria-describedby={searchError ? "city-error" : undefined} onChange={(event) => { setQuery(event.target.value); setMatches(null); setSearchError(""); }} />
          </div>
          <button type="submit" className="primary" disabled={searching}>Search</button>
        </form>
        <div className="city-shortcuts" role="group" aria-label="Popular city searches">
          {cities.map((name) => <button key={name} type="button" className="chip" disabled={searching} onClick={() => void search(name)}>{name}</button>)}
        </div>
        <p className="status-message" role="status">{searching ? "Searching for cities…" : matches ? matches.length ? "Choose a city from the results." : "No Indian locations matched. Try a nearby city." : ""}</p>
        {selectedLocation && <p className="note" role="status">Selected: {selectedLocation}</p>}
        {searchError && <p id="city-error" className="error" role="alert">{searchError}</p>}
        {matches && matches.length > 0 && <ul className="search-results">
          {matches.map((item) => (
            <li key={item.id}>
              <button type="button" aria-pressed={item.id === city?.id} onClick={() => setCity(item)}>
                <span><strong>{item.name}</strong><small>{item.region ?? "State or territory unavailable"}{item.locality && " · " + item.locality}</small></span><ArrowRight size={17} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>}
        {matches && matches.length > 0 && <p className="note">Location data from <a href="https://www.geonames.org/">GeoNames</a> via Open-Meteo.</p>}
      </section>
      <CityDashboard key={city?.id ?? "empty"} city={city} profile={profile} setProfile={setProfile} />
    </>
  );
}

function CityDashboard({ city, profile, setProfile }: { city: City | null; profile: Profile; setProfile: (profile: Profile) => void }) {
  const [air, setAir] = useState<AirQuality | null>(null);
  const [airError, setAirError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [planError, setPlanError] = useState("");
  const [generating, setGenerating] = useState(false);
  const cityId = city?.id;

  useEffect(() => {
    if (!cityId) return;
    const controller = new AbortController();
    requestJson<AirQuality>("/api/air-quality?cityId=" + cityId, { signal: controller.signal })
      .then((result) => { if (!controller.signal.aborted) setAir(result); })
      .catch((error: Error) => { if (!controller.signal.aborted) setAirError(error.message); });
    return () => controller.abort();
  }, [cityId, attempt]);

  function refresh() {
    setAir(null);
    setAirError("");
    setPlan(null);
    setPlanError("");
    setAttempt((value) => value + 1);
  }

  function editProfile(updated: Profile) {
    setProfile(updated);
    setPlan(null);
    setPlanError("");
  }

  async function submitPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!city || generating) return;
    if (!profile.members.length) {
      setPlanError("Select at least one household member.");
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
      setAir(result.air);
      setPlan(result.plan);
    } catch (error) {
      setPlanError(error instanceof Error ? error.message : "An AI plan could not be generated.");
    } finally {
      setGenerating(false);
    }
  }

  const loading = !!city && !air && !airError;
  return (
    <>
      <div className="dashboard-grid">
        <section className="panel" aria-labelledby="conditions-heading">
          <div className="section-heading">
            <span className="section-icon"><Activity size={21} aria-hidden="true" /></span>
            <div><h2 id="conditions-heading">Outdoor air quality</h2><p>{city ? [city.name, city.region, city.locality].filter(Boolean).join(" · ") : "Latest particulate concentrations"}</p></div>
          </div>
          <div role="status">
            {!city && <p className="empty-state">Choose a city to see station observations and modeled estimates.</p>}
            {loading && <p className="empty-state">Checking available data for {city.name}…</p>}
          </div>
          {airError && <p className="error" role="alert">{airError}</p>}
          {air && <>
            <SourcePanel kind="measured" data={air.measured} />
            <SourcePanel kind="modeled" data={air.modeled} />
            <p className="note">Recent means up to 3 hours old. Delayed means up to 24 hours old. Older values are marked stale. Times are shown in IST.</p>
          </>}
          {city && !loading && <button type="button" className="secondary" onClick={refresh} disabled={generating}>Refresh readings</button>}
        </section>
        <section className="panel" aria-labelledby="profile-heading">
          <div className="section-heading">
            <span className="section-icon"><Users size={20} aria-hidden="true" /></span>
            <div><h2 id="profile-heading">Your household</h2><p>Choose who the plan should help.</p></div>
          </div>
          <form onSubmit={submitPlan}>
            <fieldset disabled={generating} className="member-fieldset" aria-describedby={planError ? "profile-hint plan-error" : "profile-hint"}>
              <legend>Household members</legend>
              <div className="member-options">
                {members.map((member) => (
                  <label key={member}><input type="checkbox" checked={profile.members.includes(member)}
                    onChange={(event) => editProfile({ ...profile, members: event.target.checked ? [...profile.members, member] : profile.members.filter((item) => item !== member) })} />
                    {member}</label>
                ))}
              </div>
            </fieldset>
            <div className="selects">
              <label>Typical commute<select disabled={generating} value={profile.commute} onChange={(event) => editProfile({ ...profile, commute: event.target.value as Profile["commute"] })}>
                {commutes.map((item) => <option key={item}>{item}</option>)}
              </select></label>
              <label>What matters today?<select disabled={generating} value={profile.priority} onChange={(event) => editProfile({ ...profile, priority: event.target.value as Profile["priority"] })}>
                {priorities.map((item) => <option key={item}>{item}</option>)}
              </select></label>
            </div>
            <p className="note" id="profile-hint">Your choices are sent to Gemini when you create a plan. You only need to select categories.</p>
            <button type="submit" className="primary plan-button" disabled={!city || loading || generating}>
              <Sparkles size={17} aria-hidden="true" /> {generating ? "Creating plan…" : "Create my plan"}
            </button>
            {!city && <p className="note">Select a city to enable planning.</p>}
            <p className="status-message" role="status">{generating ? "Generating a household plan…" : plan ? "Your household plan is ready below." : ""}</p>
            {planError && <p id="plan-error" className="error" role="alert">{planError}</p>}
          </form>
        </section>
      </div>
      {plan && <PlanPanel plan={plan} />}
    </>
  );
}

function SourcePanel({ kind, data }: { kind: "measured" | "modeled"; data: DataSource }) {
  const measured = kind === "measured";
  const Icon = measured ? Radio : Layers3;
  const message = {
    available: "",
    "no-data": measured ? "No usable station readings found within 25 km." : "No usable modeled estimates were returned.",
    unavailable: measured ? "OpenAQ is temporarily unavailable." : "Open-Meteo estimates are temporarily unavailable.",
    unconfigured: "Station data is unavailable until the server is configured for OpenAQ.",
    partial: "Some nearby stations could not be checked. Available readings are shown below.",
  }[data.status];
  return (
    <div className="source-block">
      <h3><Icon size={17} aria-hidden="true" /> {measured ? "Station observations" : "Modeled estimates"}</h3>
      <p className="source-credit">{measured ? <a href="https://openaq.org/">OpenAQ</a> : <>
        <a href="https://open-meteo.com/en/docs/air-quality-api">Open-Meteo</a> · <a href="https://atmosphere.copernicus.eu/">CAMS</a> · Regional model
      </>}</p>
      {message && <p className="source-message">{message}</p>}
      {data.readings.length > 0 && <div className="readings">
        {pollutants.map((pollutant) => {
          const reading = data.readings.find((item) => item.pollutant === pollutant);
          return <div className="reading" key={pollutant}>
            <h4>{pollutantNames[pollutant]}</h4>
            {reading ? <>
              <p className="value">{reading.value} <span>{reading.unit}</span></p>
              <p className="reading-meta"><strong>{states[reading.freshness]}</strong> · <time dateTime={reading.timestamp}>{date.format(new Date(reading.timestamp))} IST</time></p>
              {reading.station && <p className="reading-meta">{reading.station.name} · {reading.station.provider} · {reading.station.distanceKm.toFixed(1)} km from city center</p>}
            </> : <p className="reading-meta">Unavailable</p>}
          </div>;
        })}
      </div>}
    </div>
  );
}

function PlanPanel({ plan }: { plan: Plan }) {
  const categories = [
    { label: "Daily routine", icon: Activity, action: plan.actions.routine },
    { label: "Indoor air", icon: House, action: plan.actions.indoor },
    { label: "Lower-emission travel", icon: Bus, action: plan.actions.travel },
  ];
  return (
    <section className="panel plan-result" aria-labelledby="plan-heading">
      <div className="section-heading">
        <span className="section-icon"><Sparkles size={20} aria-hidden="true" /></span>
        <div><h2 id="plan-heading">Your household plan</h2><p>{planBasis[plan.basis]}</p></div>
      </div>
      <div className="plan-grid">
        {categories.map(({ label, icon: Icon, action }) => <article className="action-card" key={label}>
          <h3><Icon size={17} aria-hidden="true" /> {label}</h3>
          <p className="action-title">{action.title}</p><p>{action.why}</p>
        </article>)}
      </div>
      <p className="note">Gemini selects from vetted actions. Indoor guidance is general and requires a separate sensor to measure indoor conditions.</p>
    </section>
  );
}

