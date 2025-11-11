"use client";

import { useState } from "react";
import LeatherBackground from "@/components/ui/LeatherBackground";
import GlassCard from "@/components/ui/GlassCard";
import LeatherButton from "@/components/ui/LeatherButton";
import TopMenu from "@/components/ui/TopMenu";

/**
 * Renders the documentation page with navigation controls and content sections.
 *
 * @returns The React element for the documentation page layout
 */
export default function DocsPage() {

  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      content: `Welcome to 4Diary! This guide will help you get started with our privacy-focused note-taking application.

**What is 4Diary?**

4Diary is an end-to-end encrypted note-taking application that prioritizes your privacy. All your notes are encrypted on your device before being sent to the server, ensuring that no one but you can read your content.

**Key Features:**
- End-to-end encryption with AES-256-GCM
- Zero-knowledge architecture
- Self-hostable
- Free and open-source (FLOSS)`,
    },
    {
      id: "installation",
      title: "Installation",
      content: `**Prerequisites:**
- Node.js 20+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

**Development Setup:**

1. Clone the repository:
   \`git clone https://github.com/Harsha-Bhattacharyya/4diary.git\`
   \`cd 4diary\`

2. Install dependencies:
   \`npm install\`

3. Create environment variable with your MongoDB URI:
   \`export MONGODB_URI=mongodb://localhost:27017/4diary\`

4. Run the development server:
   \`npm run dev\`

5. Open http://localhost:3000 in your browser`,
    },
    {
      id: "encryption",
      title: "Encryption & Security",
      content: `**How Encryption Works:**

1. **Master Key Generation**: A master encryption key is generated in your browser and stored securely in IndexedDB.

2. **Document Keys**: Each document has its own unique encryption key.

3. **Key Encryption**: Document keys are encrypted with your master key.

4. **Content Encryption**: Document content is encrypted with the document key using AES-256-GCM.

5. **Zero Knowledge**: Only encrypted data reaches the server. The server never has access to your unencrypted content or keys.

**Security Best Practices:**
- Never share your encryption keys
- Regularly export your data as backup
- Use a secure password manager
- Keep your browser and device secure`,
    },
    {
      id: "self-hosting",
      title: "Self-Hosting",
      content: `**Docker Deployment:**

4Diary can be easily self-hosted using Docker:

1. Clone the repository
2. Create \`.env.local\` with your configuration
3. Run: \`docker-compose up -d\`

This will start:
- Next.js app on port 3000
- MongoDB on port 27017
- Redis on port 6379

**Production Considerations:**
- Update MongoDB credentials
- Configure SSL/TLS certificates
- Set up reverse proxy (nginx/Caddy)
- Configure environment variables
- Enable monitoring and logging`,
    },
  ];

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const currentSection = sections[currentSectionIndex];

  const goToPrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  return (
    <div className="min-h-screen relative">
      <LeatherBackground />

      {/* Top Menu */}
      <div className="relative z-10">
        <TopMenu currentPage="Docs" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 py-6 fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-leather-100 mb-2">Documentation</h1>
            <div className="h-1 w-20 bg-leather-300 rounded"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="mb-6 fade-in-delay-1">
            <div className="p-8">
              <h2 className="text-3xl font-bold text-leather-100 mb-6">
                {currentSection.title}
              </h2>
              <div className="text-leather-300 prose prose-invert max-w-none whitespace-pre-line">
                {currentSection.content}
              </div>
            </div>
          </GlassCard>

          {/* Navigation */}
          <div className="flex justify-between items-center fade-in-delay-2">
            <div>
              {currentSectionIndex > 0 && (
                <LeatherButton variant="parchment" onClick={goToPrevious}>
                  ← Previous — {sections[currentSectionIndex - 1].title}
                </LeatherButton>
              )}
            </div>
            <div>
              {currentSectionIndex < sections.length - 1 && (
                <LeatherButton variant="parchment" onClick={goToNext}>
                  Next — {sections[currentSectionIndex + 1].title} →
                </LeatherButton>
              )}
            </div>
          </div>

          {/* Section Navigation */}
          <GlassCard className="mt-6 fade-in-delay-3">
            <div className="p-4">
              <h3 className="text-lg font-bold text-leather-100 mb-3">All Sections</h3>
              <div className="flex flex-wrap gap-2">
                {sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSectionIndex(index)}
                    className={`px-3 py-1 rounded-full transition-colors ${
                      index === currentSectionIndex
                        ? "bg-leather-300 text-leather-100"
                        : "text-leather-300 hover:text-leather-100"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}