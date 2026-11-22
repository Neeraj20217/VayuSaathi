import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VayuSaathi | Air quality for your household",
  description: "See the latest available air quality for Indian cities and build a personalized household plan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN"><body>{children}</body></html>;
}
