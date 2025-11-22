/**
 * Copyright © 2025 Harsha Bhattacharyya
 * 
 * This file is part of 4diary.
 * 
 * SPDX-License-Identifier: BSD-3-Clause
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the conditions in the LICENSE file are met.
 */

import type { Metadata } from "next";
import { IM_Fell_DW_Pica, IM_Fell_English } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// Note: IM Fell fonts only support weight 400. Bold text will be synthesized by the browser.
const imFellDWPica = IM_Fell_DW_Pica({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-fell-dw-pica",
});

const imFellEnglish = IM_Fell_English({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-fell-english",
});

export const metadata: Metadata = {
  title: "4diary - Privacy Focused Solution",
  description: "A privacy focused solution for the modern world",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "4Diary",
  },
  themeColor: "#f59e0b",
};

/**
 * Root layout component that applies the configured global fonts and renders the application content.
 *
 * Applies the IM Fell font CSS variable classes to the `<html>` element and wraps `children` inside a
 * `<body>` with antialiasing enabled.
 *
 * @param children - The React nodes to render as the application's page content.
 * @returns The root HTML structure (`<html>` and `<body>`) that wraps the provided `children`.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${imFellDWPica.variable} ${imFellEnglish.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f59e0b" />
        <link rel="apple-touch-icon" href="/4diary.png" />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}