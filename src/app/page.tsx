import Link from "next/link";
import { Wind } from "lucide-react";
import { Dashboard } from "@/components/dashboard";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>
      <header className="site-header">
        <div className="shell flex items-center justify-between gap-4">
          <Link href="/" className="brand"><span className="brand-icon"><Wind aria-hidden="true" size={21} /></span> VayuSaathi</Link>
          <span className="header-label">Air quality companion</span>
        </div>
      </header>
      <main id="main" className="shell">
        <div className="intro">
          <h1>Plan around the air you breathe.</h1>
          <p>Check outdoor air quality in your city and get practical ideas for your household, home and commute.</p>
        </div>
        <Dashboard />
      </main>
      <footer className="shell footer">VayuSaathi <span>·</span> PromptWars Challenge 06</footer>
    </>
  );
}
