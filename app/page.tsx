"use client";

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

import Link from "next/link";
import Script from "next/script";
import LeatherBackground from "@/components/ui/LeatherBackground";
import LeatherButton from "@/components/ui/LeatherButton";
import TopMenu from "@/components/ui/TopMenu";
import Image from "next/image";

/**
 * Render the homepage containing the hero, feature cards, story sections, and footer.
 *
 * Renders a long-scrolling landing page with multiple sections including hero, storytelling,
 * feature highlights, and call-to-action sections.
 *
 * @returns The React element representing the homepage layout.
 */
export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "4diary",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web, Windows, macOS, Linux, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    },
    "description": "Privacy-focused, end-to-end encrypted note-taking application with military-grade AES-256 encryption, zero-knowledge architecture, and Notion-like editing. Self-hostable & open-source.",
    "url": "https://4diary.vercel.app",
    "image": "https://4diary.vercel.app/4diary.png",
    "author": {
      "@type": "Person",
      "name": "Harsha Bhattacharyya",
      "url": "https://github.com/Harsha-Bhattacharyya"
    },
    "publisher": {
      "@type": "Organization",
      "name": "4diary",
      "logo": {
        "@type": "ImageObject",
        "url": "https://4diary.vercel.app/4diary.png"
      }
    },
    "softwareVersion": "0.1.0-alpha",
    "datePublished": "2025-01-01",
    "dateModified": "2025-11-23",
    "featureList": [
      "End-to-End Encryption with AES-256-GCM",
      "Zero-Knowledge Architecture",
      "Notion-like Rich Text Editor",
      "Kanban Boards for Task Management",
      "Ephemeral Share Links",
      "Quick Note Feature",
      "Quick Read Mode",
      "Backlinks with Wiki-style Syntax",
      "Calendar View",
      "Version History",
      "Export to Markdown and ZIP",
      "Self-Hostable with Docker",
      "PWA Support with Offline Capabilities",
      "Keyboard Shortcuts",
      "Full-screen Editor",
      "Leather-themed UI",
      "Templates for Quick Start"
    ],
    "securityFeatures": [
      "Military-grade AES-256 encryption",
      "Zero-knowledge architecture",
      "Client-side only encryption",
      "End-to-end encrypted sharing",
      "No server access to content",
      "Master key stored locally",
      "Secure session management"
    ],
    "license": "https://opensource.org/licenses/BSD-3-Clause",
    "isAccessibleForFree": true,
    "isFamilyFriendly": true,
    "inLanguage": "en"
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "4diary",
    "url": "https://4diary.vercel.app",
    "logo": "https://4diary.vercel.app/4diary.png",
    "description": "Privacy-focused, end-to-end encrypted note-taking application",
    "foundingDate": "2025",
    "foundingLocation": "India",
    "sameAs": [
      "https://github.com/Harsha-Bhattacharyya/4diary"
    ]
  };

  const webpageData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "4diary - End-to-End Encrypted Note-Taking App",
    "description": "Privacy-focused, end-to-end encrypted note-taking with military-grade AES-256 encryption, zero-knowledge architecture, and Notion-like editing.",
    "url": "https://4diary.vercel.app",
    "inLanguage": "en",
    "isPartOf": {
      "@type": "WebSite",
      "name": "4diary",
      "url": "https://4diary.vercel.app"
    },
    "about": {
      "@type": "Thing",
      "name": "Privacy and Security in Note-Taking"
    },
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": "https://4diary.vercel.app/4diary.png",
      "width": 1200,
      "height": 630
    }
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is 4diary really secure?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! 4diary uses military-grade AES-256-GCM encryption with a zero-knowledge architecture. This means your notes are encrypted on your device before being sent to the server, and we never have access to your unencrypted content. The encryption keys are stored only on your device, ensuring complete privacy."
        }
      },
      {
        "@type": "Question",
        "name": "What is zero-knowledge encryption?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Zero-knowledge encryption means that the server never sees your unencrypted data. All encryption and decryption happens on your device (client-side), so even if our servers were compromised, your notes would remain secure because we never have access to your encryption keys."
        }
      },
      {
        "@type": "Question",
        "name": "Can I self-host 4diary?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! 4diary is open-source and designed to be self-hostable. We provide Docker containers and detailed documentation to help you run your own instance. This gives you complete control over your data and infrastructure."
        }
      },
      {
        "@type": "Question",
        "name": "Does 4diary work offline?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! 4diary is a Progressive Web App (PWA) with offline support. You can install it on your device and continue taking notes even without an internet connection. Your notes will sync automatically when you're back online."
        }
      },
      {
        "@type": "Question",
        "name": "What features does 4diary offer?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "4diary offers a rich set of features including: Notion-like rich text editing, Kanban boards for task management, Quick Note feature (Ctrl/Cmd + Q), backlinks with wiki-style syntax, ephemeral share links, templates, calendar view, version history, export to Markdown and ZIP, and much more - all with end-to-end encryption."
        }
      },
      {
        "@type": "Question",
        "name": "Is 4diary free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! 4diary is completely free and open-source software (FLOSS) licensed under the BSD-3-Clause license. You can use it, modify it, and even distribute it freely. There are no premium tiers or hidden costs."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen relative">
      <Script
        id="structured-data-software"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="structured-data-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <Script
        id="structured-data-webpage"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageData) }}
      />
      <Script
        id="structured-data-faq"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
      <LeatherBackground />
      
      {/* Top Menu */}
      <div className="relative z-[350]">
        <TopMenu currentPage="Home" />
      </div>
      
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
          <div className="max-w-4xl mx-auto text-center fade-in">
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
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-delay-2">
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
            
            {/* Scroll Indicator */}
            <div className="mt-16 fade-in-delay-3 animate-bounce">
              <svg className="w-8 h-8 mx-auto text-leather-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-black/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-leather-100 mb-8 text-center">
              The Growing Need for Privacy
            </h2>
            <div className="space-y-8 text-lg md:text-xl text-leather-200 leading-relaxed">
              <p className="text-center">
                In our modern day and age, the note-taking industry is growing faster than ever.
              </p>
              <p className="text-center text-2xl md:text-3xl text-leather-100 font-serif italic py-4">
                Notes are like paper but better and faster.
              </p>
              <p className="text-center">
                One&apos;s notes are the gateway to one&apos;s thoughts, beliefs and life...
              </p>
            </div>
          </div>
        </section>

        {/* The Question Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-leather-100 mb-12">
              But what if someone got access to these?
            </h2>
            <p className="text-2xl md:text-3xl text-leather-200 mb-8">
              Just what if someone knew your deepest darkest secrets?
            </p>
            <div className="w-32 h-1 bg-leather-400 mx-auto my-12"></div>
            <p className="text-3xl md:text-4xl text-leather-100 font-bold">
              Well with 4diary you don&apos;t have to worry anymore.
            </p>
          </div>
        </section>

        {/* E2E Encryption Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-black/30">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-8xl md:text-9xl mb-8">🔐</div>
            <h2 className="text-4xl md:text-5xl font-bold text-leather-100 mb-8">
              E2E Encryption
            </h2>
            <p className="text-xl md:text-2xl text-leather-200 leading-relaxed">
              With our E2E encryption model not even the server knows what you write.
            </p>
          </div>
        </section>

        {/* No Password Storage Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-8xl md:text-9xl mb-8">🔑</div>
            <h2 className="text-4xl md:text-5xl font-bold text-leather-100 mb-8">
              Password Leaks? No Problem.
            </h2>
            <p className="text-xl md:text-2xl text-leather-200 leading-relaxed">
              4diary doesn&apos;t store your password in our databases.
            </p>
          </div>
        </section>

        {/* Web App Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-black/30">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-8xl md:text-9xl mb-8">🌐</div>
            <h2 className="text-4xl md:text-5xl font-bold text-leather-100 mb-8">
              Works Everywhere
            </h2>
            <p className="text-xl md:text-2xl text-leather-200 leading-relaxed">
              Working on an obscure platform? 4diary is a web app so you only need a browser.
            </p>
          </div>
        </section>

        {/* FLOSS Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-8xl md:text-9xl mb-8">💻</div>
            <h2 className="text-4xl md:text-5xl font-bold text-leather-100 mb-8">
              Don&apos;t Trust Us? You Don&apos;t Have To!
            </h2>
            <p className="text-xl md:text-2xl text-leather-200 leading-relaxed mb-8">
              We are FLOSS and fully self-hostable.
            </p>
            <p className="text-lg text-leather-300">
              Free/Libre Open Source Software means you can verify every line of code.
            </p>
          </div>
        </section>

        {/* Why 4Diary Feature Cards Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20 bg-black/30">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-leather-100 mb-12 text-center">
              Why 4Diary?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start gap-4 p-6 rounded-lg bg-leather-600 bg-opacity-30 hover:bg-opacity-50 transition-all border border-leather-500/30">
                <span className="text-3xl font-bold text-leather-100 flex-shrink-0">①</span>
                <div>
                  <h3 className="font-bold text-xl text-leather-100 mb-2">AES Encryption</h3>
                  <p className="text-leather-200">Military-grade security for your data</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-leather-600 bg-opacity-30 hover:bg-opacity-50 transition-all border border-leather-500/30">
                <span className="text-3xl font-bold text-leather-100 flex-shrink-0">②</span>
                <div>
                  <h3 className="font-bold text-xl text-leather-100 mb-2">Zero-Knowledge</h3>
                  <p className="text-leather-200">Server never sees your writing</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-leather-600 bg-opacity-30 hover:bg-opacity-50 transition-all border border-leather-500/30">
                <span className="text-3xl font-bold text-leather-100 flex-shrink-0">③</span>
                <div>
                  <h3 className="font-bold text-xl text-leather-100 mb-2">Self-Hostable</h3>
                  <p className="text-leather-200">Run it yourself, own your data</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-6 rounded-lg bg-leather-600 bg-opacity-30 hover:bg-opacity-50 transition-all border border-leather-500/30">
                <span className="text-3xl font-bold text-leather-100 flex-shrink-0">④</span>
                <div>
                  <h3 className="font-bold text-xl text-leather-100 mb-2">FLOSS</h3>
                  <p className="text-leather-200">Free, open-source, endless freedom</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-leather-100 mb-8">
              Let&apos;s keep our thoughts to ourselves
            </h2>
            <p className="text-2xl md:text-3xl text-leather-200 mb-12 font-serif italic">
              with 4diary.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/workspace">
                <LeatherButton variant="gradient" size="lg">
                  Get Started Now
                </LeatherButton>
              </Link>
              <Link href="/docs">
                <LeatherButton variant="parchment" size="lg">
                  Learn More
                </LeatherButton>
              </Link>
            </div>
          </div>
        </section>

        {/* Learn More Section */}
        <section className="py-12 bg-black/30">
          <div className="max-w-4xl mx-auto text-center">
            <Link 
              href="/about" 
              className="inline-flex items-center gap-2 text-leather-200 hover:text-leather-100 transition-colors text-lg group"
            >
              <span>Learn More About 4diary</span>
              <svg 
                className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-leather-300 text-sm py-12 bg-black/40">
          <p>Made with ❤️ in 🇮🇳</p>
        </footer>
      </main>
    </div>
  );
}
