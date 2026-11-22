import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VayuSaathi — Urban Air Quality Intelligence",
  description:
    "Grounded urban air quality observations and personalized household guidance across Indian cities, integrating OpenAQ ground stations, Copernicus CAMS models, and Google Gemini.",
};

export const viewport: Viewport = {
  themeColor: "#165A4A",
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
