"use client";

import Link from "next/link";
import LeatherBackground from "@/components/ui/LeatherBackground";
import LeatherButton from "@/components/ui/LeatherButton";
import TopMenu from "@/components/ui/TopMenu";
import Image from "next/image";

/**
 * Render the homepage containing the hero, feature cards, and footer.
 *
 * Renders a centered hero section with branding and primary call-to-action buttons (links to /workspace and /docs), a responsive features grid of cards, and a footer with country/region.
 *
 * @returns The React element representing the homepage layout.
 */
export default function Home() {
  return (
    <div className="min-h-screen relative">
      <LeatherBackground />
      
      {/* Top Menu */}
      <div className="relative z-[350]">
        <TopMenu currentPage="Home" />
      </div>
      
      <main className="relative z-10 flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 py-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16 fade-in">
          {/* Logo Image */}
          <div className="mb-6 flex justify-center">
            <Image
              src="/4diary.png"
              alt="4Diary Logo"
              width={400}
              height={150}
              priority
              className="w-auto h-auto max-w-full"
            />
          </div>
          
          {/* Tagline in Header Style with Quotes */}
          <h2 className="text-3xl md:text-4xl font-serif italic text-leather-100 mb-12 fade-in-delay-1">
            &ldquo;Catering to your note needs with privacy and style.&rdquo;
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20 fade-in-delay-2">
            <Link href="/workspace">
              <LeatherButton variant="gradient" size="lg">
                Get Started
              </LeatherButton>
            </Link>
            <Link href="/docs">
              <LeatherButton variant="parchment" size="lg">
                View Docs
              </LeatherButton>
            </Link>
          </div>

          {/* Why 4Diary Section - Darker, More Professional */}
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-leather-400 shadow-2xl fade-in-delay-3">
            <h2 className="text-3xl md:text-4xl font-bold text-leather-100 mb-8 tracking-wide">
              Why 4Diary?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-leather-600 bg-opacity-30 hover:bg-opacity-50 transition-all">
                <span className="text-3xl font-bold text-leather-100 flex-shrink-0">①</span>
                <div>
                  <h3 className="font-bold text-xl text-leather-100 mb-2">AES Encryption</h3>
                  <p className="text-leather-200">Military-grade security for your data</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-leather-600 bg-opacity-30 hover:bg-opacity-50 transition-all">
                <span className="text-3xl font-bold text-leather-100 flex-shrink-0">②</span>
                <div>
                  <h3 className="font-bold text-xl text-leather-100 mb-2">Zero-Knowledge</h3>
                  <p className="text-leather-200">Server never sees your writing</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-leather-600 bg-opacity-30 hover:bg-opacity-50 transition-all">
                <span className="text-3xl font-bold text-leather-100 flex-shrink-0">③</span>
                <div>
                  <h3 className="font-bold text-xl text-leather-100 mb-2">Self-Hostable</h3>
                  <p className="text-leather-200">Run it yourself, own your data</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-leather-600 bg-opacity-30 hover:bg-opacity-50 transition-all">
                <span className="text-3xl font-bold text-leather-100 flex-shrink-0">④</span>
                <div>
                  <h3 className="font-bold text-xl text-leather-100 mb-2">FLOSS</h3>
                  <p className="text-leather-200">Free, open-source, endless freedom</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-leather-300 text-sm fade-in-delay-2 mt-8">
          <p>Made with ❤️ in 🇮🇳</p>
        </footer>
      </main>
    </div>
  );
}
