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

import type { Metadata, Viewport } from "next";
import { IM_Fell_DW_Pica, IM_Fell_English } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f59e0b" },
    { media: "(prefers-color-scheme: dark)", color: "#78350f" }
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL('https://4diary.vercel.app'),
  title: {
    default: "4diary - End-to-End Encrypted Note-Taking App | Privacy-First Digital Journal",
    template: "%s | 4diary"
  },
  description: "4diary is a privacy-focused, end-to-end encrypted note-taking application with military-grade AES-256 encryption, zero-knowledge architecture, and Notion-like editing. Self-hostable, open-source, and FLOSS. Perfect for secure journaling, task management with Kanban boards, and private documentation.",
  keywords: [
    "encrypted notes",
    "privacy-focused notepad",
    "end-to-end encryption",
    "secure note-taking",
    "digital journal",
    "encrypted diary",
    "zero-knowledge notes",
    "AES-256 encryption",
    "private notepad",
    "secure journaling",
    "self-hosted notes",
    "open-source notes",
    "notion alternative",
    "encrypted documentation",
    "privacy journal",
    "secure task manager",
    "encrypted kanban",
    "FLOSS notes app",
    "web crypto API",
    "markdown notes",
    "encrypted workspace",
    "private wiki",
    "secure knowledge base",
    "blockchain notes",
    "military-grade encryption",
    "offline notes",
    "PWA notes",
    "collaborative notes",
    "share encrypted notes",
    "ephemeral sharing",
    "backlinks wiki",
    "zettelkasten",
    "note templates",
    "quick notes",
    "distraction-free writing",
    "reader mode",
    "version history",
    "document versioning",
    "calendar notes",
    "tags folders",
    "emoji icons",
    "rich text editor",
    "blocknote editor",
    "next.js notes",
    "typescript notes",
    "mongodb notes",
    "redis cache",
    "docker notes",
    "vercel deployment",
    "export markdown",
    "export zip",
    "keyboard shortcuts",
    "full-screen editor",
    "leather theme",
    "glass morphism",
    "responsive design",
    "mobile notes",
    "tablet notes",
    "desktop notes",
    "cross-platform",
    "browser-based encryption",
    "client-side encryption",
    "no server access",
    "privacy by design",
    "GDPR compliant",
    "secure by default",
    "privacy first",
    "data sovereignty",
    "self-custody",
    "own your data",
    "local encryption",
    "encryption keys",
    "master key",
    "document encryption",
    "encrypted metadata",
    "secure authentication",
    "session cookies",
    "email auth",
    "secure login",
    "encrypted storage",
    "indexeddb",
    "local storage",
    "progressive web app",
    "offline first",
    "service worker",
    "background sync",
    "push notifications",
    "installable app",
    "native feel",
    "fast performance",
    "optimized loading",
    "code splitting",
    "lazy loading",
    "responsive images",
    "web vitals",
    "core web vitals",
    "seo optimized",
    "semantic html",
    "accessibility",
    "wcag compliant",
    "screen reader friendly",
    "keyboard navigation",
    "aria labels",
    "focus management",
    "high contrast",
    "dark mode",
    "light mode",
    "custom themes",
    "personalization",
    "user preferences",
    "customizable",
    "extensible",
    "api ready",
    "developer friendly",
    "well documented",
    "comprehensive docs",
    "tutorials",
    "guides",
    "examples",
    "code samples",
    "best practices",
    "security guidelines",
    "contribution guide",
    "open contribution",
    "community driven",
    "active development",
    "regular updates",
    "bug fixes",
    "feature requests",
    "roadmap",
    "changelog",
    "release notes",
    "version control",
    "git workflow",
    "ci cd",
    "automated testing",
    "unit tests",
    "e2e tests",
    "playwright tests",
    "test coverage",
    "code quality",
    "linting",
    "formatting",
    "type safety",
    "typescript strict",
    "error handling",
    "logging",
    "monitoring",
    "sentry integration",
    "analytics",
    "vercel analytics",
    "speed insights",
    "performance monitoring",
    "uptime monitoring",
    "status page",
    "health checks",
    "api endpoints",
    "rest api",
    "graphql",
    "webhooks",
    "real-time updates",
    "websockets",
    "live collaboration",
    "concurrent editing",
    "conflict resolution",
    "operational transform",
    "crdt",
    "sync engine",
    "offline sync",
    "conflict-free",
    "eventual consistency",
    "distributed system",
    "scalable architecture",
    "microservices",
    "serverless",
    "edge computing",
    "cdn cached",
    "global distribution",
    "low latency",
    "high availability",
    "fault tolerant",
    "disaster recovery",
    "backup restore",
    "data migration",
    "import export",
    "bulk operations",
    "batch processing",
    "queue management",
    "background jobs",
    "scheduled tasks",
    "cron jobs",
    "automation",
    "workflows",
    "integrations",
    "third party",
    "zapier",
    "ifttt",
    "oauth",
    "sso",
    "saml",
    "ldap",
    "active directory",
    "enterprise ready",
    "team workspace",
    "organization",
    "multi-tenant",
    "role-based access",
    "permissions",
    "access control",
    "audit logs",
    "compliance",
    "regulations",
    "hipaa",
    "sox",
    "iso 27001",
    "soc 2",
    "pen testing",
    "vulnerability scan",
    "security audit",
    "penetration testing",
    "bug bounty",
    "responsible disclosure",
    "security updates",
    "patch management",
    "dependency updates",
    "npm audit",
    "snyk scan",
    "github security",
    "dependabot",
    "renovate bot",
    "automated pr",
    "continuous integration",
    "github actions",
    "deployment pipeline",
    "staging environment",
    "production deploy",
    "canary release",
    "blue-green deploy",
    "rolling updates",
    "zero downtime",
    "load balancing",
    "horizontal scaling",
    "vertical scaling",
    "auto scaling",
    "resource optimization",
    "cost efficiency",
    "budget friendly",
    "free tier",
    "open source license",
    "bsd license",
    "permissive license",
    "commercial use",
    "modification allowed",
    "distribution allowed",
    "attribution required",
    "no warranty",
    "as-is basis",
    "community support",
    "discord server",
    "slack channel",
    "forum",
    "mailing list",
    "social media",
    "twitter updates",
    "linkedin presence",
    "product hunt",
    "hacker news",
    "reddit community",
    "youtube tutorials",
    "blog posts",
    "case studies",
    "success stories",
    "testimonials",
    "reviews",
    "ratings",
    "awards",
    "recognition",
    "featured app",
    "top rated",
    "most popular",
    "trending",
    "viral",
    "growth hacking",
    "marketing strategy",
    "seo strategy",
    "content marketing",
    "inbound marketing",
    "outreach",
    "partnerships",
    "affiliates",
    "referral program",
    "user acquisition",
    "retention rate",
    "churn reduction",
    "user engagement",
    "active users",
    "daily active",
    "monthly active",
    "lifetime value",
    "conversion rate",
    "funnel optimization",
    "a b testing",
    "experimentation",
    "feature flags",
    "gradual rollout",
    "feedback loop",
    "user research",
    "surveys",
    "interviews",
    "usability testing",
    "ux design",
    "ui design",
    "design system",
    "component library",
    "style guide",
    "brand identity",
    "logo design",
    "color palette",
    "typography",
    "iconography",
    "illustrations",
    "animations",
    "micro interactions",
    "transitions",
    "loading states",
    "empty states",
    "error states",
    "success messages",
    "toast notifications",
    "modal dialogs",
    "dropdown menus",
    "context menus",
    "sidebars",
    "navigation bars",
    "breadcrumbs",
    "pagination",
    "infinite scroll",
    "virtual scrolling",
    "lazy rendering",
    "performance optimization",
    "memory efficiency",
    "cpu optimization",
    "battery saving",
    "bandwidth optimization",
    "compression",
    "minification",
    "bundling",
    "tree shaking",
    "dead code elimination",
    "source maps",
    "debugging tools",
    "dev tools",
    "browser extensions",
    "mobile apps",
    "ios app",
    "android app",
    "electron app",
    "desktop app",
    "windows app",
    "mac app",
    "linux app",
    "chrome extension",
    "firefox addon",
    "safari extension",
    "edge extension",
    "browser compatibility",
    "cross browser",
    "polyfills",
    "fallbacks",
    "progressive enhancement",
    "graceful degradation",
    "backwards compatibility",
    "future proof",
    "evergreen browsers",
    "modern web",
    "web standards",
    "w3c compliant",
    "html5",
    "css3",
    "es6 javascript",
    "typescript support",
    "jsx tsx",
    "react hooks",
    "next js app router",
    "server components",
    "client components",
    "hybrid rendering",
    "static generation",
    "server side rendering",
    "incremental static",
    "on-demand revalidation",
    "api routes",
    "middleware",
    "edge functions",
    "serverless functions",
    "lambda functions",
    "function as service",
    "backend as service",
    "database as service",
    "platform as service",
    "infrastructure as code",
    "terraform",
    "kubernetes",
    "docker compose",
    "containerization",
    "orchestration",
    "service mesh",
    "istio",
    "envoy proxy",
    "nginx",
    "apache",
    "reverse proxy",
    "load balancer",
    "api gateway",
    "rate limiting",
    "throttling",
    "caching strategy",
    "cache invalidation",
    "cache warming",
    "redis cache",
    "memcached",
    "varnish cache",
    "cloudflare cdn",
    "cloudfront cdn",
    "akamai cdn",
    "fastly cdn",
    "content delivery",
    "edge caching",
    "geo distribution",
    "multi region",
    "active active",
    "active passive",
    "failover",
    "redundancy",
    "high availability cluster",
    "database replication",
    "master slave",
    "master master",
    "sharding",
    "partitioning",
    "indexing",
    "query optimization",
    "database tuning",
    "connection pooling",
    "transaction management",
    "acid compliance",
    "eventual consistency model",
    "nosql database",
    "mongodb atlas",
    "document database",
    "json storage",
    "bson format",
    "aggregation pipeline",
    "map reduce",
    "full text search",
    "elasticsearch",
    "algolia search",
    "fuzzy search",
    "semantic search",
    "vector search",
    "ai powered",
    "machine learning",
    "natural language",
    "sentiment analysis",
    "text classification",
    "named entity recognition",
    "text summarization",
    "keyword extraction",
    "topic modeling",
    "content recommendation",
    "personalized feed",
    "smart suggestions",
    "auto complete",
    "spell check",
    "grammar check",
    "writing assistant",
    "ai editor",
    "copilot integration",
    "gpt integration",
    "llm powered",
    "chatbot",
    "virtual assistant",
    "voice input",
    "speech recognition",
    "text to speech",
    "voice commands",
    "hands free",
    "accessibility features",
    "inclusive design",
    "universal design",
    "barrier free",
    "assistive technology",
    "screen magnifier",
    "color blind mode",
    "dyslexia friendly",
    "easy read",
    "plain language",
    "simple interface",
    "intuitive ux",
    "user friendly",
    "beginner friendly",
    "onboarding flow",
    "tutorial mode",
    "help documentation",
    "contextual help",
    "tooltips",
    "guided tour",
    "interactive demo",
    "sandbox mode",
    "test environment",
    "demo data",
    "sample content",
    "starter templates",
    "boilerplate",
    "scaffolding",
    "code generator",
    "cli tool",
    "npm package",
    "yarn package",
    "pnpm support",
    "package manager",
    "dependency management",
    "version management",
    "semantic versioning",
    "changelog generation",
    "release automation",
    "git tags",
    "github releases",
    "npm publish",
    "registry",
    "private registry",
    "artifact repository",
    "binary storage"
  ],
  authors: [
    { name: "Harsha Bhattacharyya", url: "https://github.com/Harsha-Bhattacharyya" }
  ],
  creator: "Harsha Bhattacharyya",
  publisher: "4diary",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "4Diary",
    startupImage: [
      {
        url: "/4diary.png",
        media: "(prefers-color-scheme: dark)"
      }
    ]
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://4diary.vercel.app",
    siteName: "4diary",
    title: "4diary - End-to-End Encrypted Note-Taking App",
    description: "Privacy-focused, end-to-end encrypted note-taking with military-grade AES-256 encryption, zero-knowledge architecture, and Notion-like editing. Self-hostable & open-source.",
    images: [
      {
        url: "/4diary.png",
        width: 1200,
        height: 630,
        alt: "4diary - Privacy-Focused Encrypted Notes"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "4diary - End-to-End Encrypted Note-Taking App",
    description: "Privacy-focused, end-to-end encrypted note-taking with military-grade AES-256 encryption, zero-knowledge architecture, and Notion-like editing.",
    images: ["/4diary.png"],
    creator: "@4diary",
    site: "@4diary"
  },
  alternates: {
    canonical: "https://4diary.vercel.app"
  },
  category: "productivity",
  classification: "Privacy, Security, Note-Taking, Productivity, Journaling",
  referrer: "origin-when-cross-origin",
  applicationName: "4diary",
  generator: "Next.js",
  abstract: "End-to-end encrypted note-taking application with zero-knowledge architecture",
  archives: [],
  assets: [],
  bookmarks: []
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
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "4diary",
    "url": "https://4diary.vercel.app",
    "description": "Privacy-focused, end-to-end encrypted note-taking application",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://4diary.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "4diary",
      "logo": {
        "@type": "ImageObject",
        "url": "https://4diary.vercel.app/4diary.png"
      }
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://4diary.vercel.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Docs",
        "item": "https://4diary.vercel.app/docs"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "About",
        "item": "https://4diary.vercel.app/about"
      }
    ]
  };

  return (
    <html lang="en" className={`${imFellDWPica.variable} ${imFellEnglish.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f59e0b" />
        <link rel="apple-touch-icon" href="/4diary.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="4Diary" />
        <meta name="application-name" content="4diary" />
        <meta name="msapplication-TileColor" content="#f59e0b" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="format-detection" content="date=no" />
        <meta name="format-detection" content="address=no" />
        <meta name="format-detection" content="email=no" />
        <link rel="icon" type="image/png" sizes="32x32" href="/4diary.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/4diary.png" />
        <link rel="shortcut icon" href="/4diary.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/4diary.png" />
        <link rel="mask-icon" href="/4diary.png" color="#f59e0b" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://cdn.vercel-insights.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="rating" content="General" />
        <meta name="distribution" content="Global" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="320" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <link rel="author" href="https://github.com/Harsha-Bhattacharyya" />
        <link rel="me" href="https://github.com/Harsha-Bhattacharyya" />
        <link rel="help" href="https://github.com/Harsha-Bhattacharyya/4diary/discussions" />
        <link rel="license" href="https://github.com/Harsha-Bhattacharyya/4diary/blob/main/LICENSE" />
        <link rel="humans" href="/humans.txt" />
      </head>
      <body className="antialiased">
        <Script
          id="website-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Script
          id="breadcrumb-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}