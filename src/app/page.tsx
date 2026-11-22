import Link from "next/link";
import { Wind } from "lucide-react";
import { Dashboard } from "@/components/dashboard";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      {/* Atmospheric Telemetry Masthead */}
      <header className="site-header">
        <div className="shell header-inner">
          <Link href="/" className="brand">
            <span className="brand-symbol" aria-hidden="true">
              <Wind size={20} />
            </span>
            <div className="brand-text">
              <h1 className="brand-name">VayuSaathi</h1>
              <span className="brand-sub">Air quality for your household</span>
            </div>
          </Link>

          <div className="masthead-status">
            <span className="masthead-time">IST (UTC+05:30)</span>
            <span className="masthead-sep" aria-hidden="true">·</span>
            <span className="masthead-network">OpenAQ & CAMS</span>
          </div>
        </div>
      </header>

      {/* Main Observatory Area */}
      <main id="main" tabIndex={-1}>
        <Dashboard />
      </main>

      {/* Civic Telemetry Footer */}
      <footer id="about-project" className="site-footer">
        <div className="shell">
          <div className="footer-grid">
            <div className="footer-col" style={{ maxWidth: "440px" }}>
              <div className="footer-brand">
                <span className="brand-symbol small" aria-hidden="true">
                  <Wind size={16} />
                </span>
                <span className="brand-name">VayuSaathi</span>
              </div>
              <p className="footer-desc">
                An urban environmental intelligence assistant engineered for Indian households during seasonal smog and particulate spikes. Built for PromptWars Challenge 06.
              </p>
            </div>

            <div className="footer-col">
              <h2 className="footer-heading">Telemetry & Scientific Sources</h2>
              <ul className="footer-links-list">
                <li>
                  <a href="https://openaq.org/" target="_blank" rel="noopener noreferrer">
                    OpenAQ API v3 (Physical Ground Stations)
                  </a>
                </li>
                <li>
                  <a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noopener noreferrer">
                    Open-Meteo & Copernicus CAMS (Atmospheric Model)
                  </a>
                </li>
                <li>
                  <a href="https://www.geonames.org/" target="_blank" rel="noopener noreferrer">
                    GeoNames Indian Municipality Geocoding
                  </a>
                </li>
                <li>
                  <a href="https://ai.google.dev/" target="_blank" rel="noopener noreferrer">
                    Google Gemini (Structured Action Selection)
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-col" id="how-it-works">
              <h2 className="footer-heading">Civic Guidance & Principles</h2>
              <p className="footer-desc" style={{ maxWidth: "340px" }}>
                Shows outdoor particle concentrations in µg/m³, with separate labels for station readings and model estimates.
              </p>
              <ul className="footer-links-list">
                <li>
                  <a href="https://www.epa.gov/indoor-air-quality-iaq/indoor-particulate-matter" target="_blank" rel="noopener noreferrer">
                    EPA Guidance on Indoor Particulate Matter
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-sub-bar">
            <span>© 2026 VayuSaathi · PromptWars Challenge 06 Submission</span>
            <span>Submission Deadline: 29 November 2026, 11:59 PM IST</span>
          </div>
        </div>
      </footer>
    </>
  );
}
