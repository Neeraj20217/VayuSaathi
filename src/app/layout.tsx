import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VayuSaathi — Urban Air Quality Assistant | PromptWars Challenge 06",
  description:
    "Real air quality and personalized guidance for you and your family across Indian cities, powered by OpenAQ, Open-Meteo, and Google Gemini.",
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
