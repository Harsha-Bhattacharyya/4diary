import type { Metadata } from "next";
import { IM_Fell_DW_Pica, IM_Fell_English } from "next/font/google";
import "./globals.css";

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
