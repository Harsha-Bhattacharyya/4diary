import type { Metadata } from "next";
import { IM_Fell_DW_Pica, IM_Fell_English } from "next/font/google";
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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}