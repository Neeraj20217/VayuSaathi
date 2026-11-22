import Link from "next/link";
import { Sparkles, Wind, HelpCircle, Info, Home as HomeIcon } from "lucide-react";
import { Dashboard } from "@/components/dashboard";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      {/* Primary Sticky Header */}
      <header className="site-header">
        <div className="shell flex items-center justify-between gap-4">
          <Link href="/" className="brand">
            <span className="brand-icon" aria-hidden="true">
              <Wind size={22} />
            </span>
            <div className="brand-text">
              <span className="brand-title">VayuSaathi</span>
              <span className="brand-sub">Your Urban Air Quality Assistant</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="header-nav" aria-label="Main Navigation">
            <Link href="/" className="nav-link active" aria-current="page">
              <HomeIcon size={16} aria-hidden="true" />
              <span>Home</span>
            </Link>
            <a href="#how-it-works" className="nav-link">
              <HelpCircle size={16} aria-hidden="true" />
              <span>How It Works</span>
            </a>
            <a href="#about-project" className="nav-link">
              <Info size={16} aria-hidden="true" />
              <span>About</span>
            </a>
            <span className="genai-badge" aria-label="Powered by Google Gemini Generative AI">
              <Sparkles size={13} aria-hidden="true" />
              <span>Powered by GenAI</span>
            </span>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main" tabIndex={-1}>
        <Dashboard />

      </main>

      {/* Site Footer */}
      <footer id="about-project" className="site-footer">
        <div className="shell">
          <div className="footer-content">
            <div style={{ maxWidth: "420px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span className="brand-icon" style={{ width: "32px", height: "32px", borderRadius: "8px" }}>
                  <Wind size={18} aria-hidden="true" />
                </span>
                <strong style={{ fontSize: "1.1rem", color: "var(--ink)" }}>VayuSaathi</strong>
              </div>
              <p style={{ margin: 0, lineHeight: 1.5 }}>
                An urban air quality assistant developed for <strong>PromptWars Virtual Challenge 06</strong>. Helping Indian households navigate winter smog with grounded outdoor intelligence and actionable lifestyle guidance.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "0.92rem", fontWeight: 750, color: "var(--ink)", margin: "0 0 10px" }}>
                Data & Providers
              </h2>
              <div className="footer-links" style={{ flexDirection: "column", gap: "6px" }}>
                <a href="https://openaq.org/" target="_blank" rel="noopener noreferrer">
                  OpenAQ API v3 (Ground Stations)
                </a>
                <a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noopener noreferrer">
                  Open-Meteo & Copernicus CAMS (Atmospheric Model)
                </a>
                <a href="https://www.geonames.org/" target="_blank" rel="noopener noreferrer">
                  GeoNames Geocoding Service
                </a>
                <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer">
                  Google Gemini (Structured Action Selection)
                </a>
              </div>
            </div>

            <section id="how-it-works" aria-labelledby="how-it-works-heading">
              <h2 id="how-it-works-heading" style={{ fontSize: "0.92rem", fontWeight: 750, color: "var(--ink)", margin: "0 0 10px" }}>
                How It Works
              </h2>
              <p style={{ margin: 0, maxWidth: "300px", lineHeight: 1.5 }}>
                Choose a city to compare station observations and modeled estimates. Select your household and commute options to request a Gemini-selected plan.
              </p>
              <div className="footer-links">
                <a href="https://www.epa.gov/indoor-air-quality-iaq/indoor-particulate-matter">EPA guidance on indoor particles</a>
              </div>
            </section>
          </div>

          <div style={{ borderTop: "1px solid var(--line)", paddingTop: "18px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", fontSize: "0.8rem" }}>
            <span>© 2026 VayuSaathi · PromptWars Challenge 06 Submission</span>
            <span>Submission Deadline: 29 November 2026, 11:59 PM IST</span>
          </div>
        </div>
      </footer>
    </>
  );
}
