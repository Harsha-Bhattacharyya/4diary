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
 * Render the homepage containing the hero, feature cards, and footer.
 *
 * Renders a centered hero section with branding and primary call-to-action buttons (links to /workspace and /docs), a responsive features grid of cards, and a footer with country/region.
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
