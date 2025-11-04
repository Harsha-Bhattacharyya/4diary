import Link from "next/link";
import FruityBackground from "@/components/ui/FruityBackground";
import GlassCard from "@/components/ui/GlassCard";
import FruityButton from "@/components/ui/FruityButton";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <FruityBackground />
      
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-aqua-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            4diary
          </h1>
          <p className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Privacy-First Note-Taking
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Your thoughts, encrypted end-to-end. A beautiful, Notion-like editor with military-grade encryption. 
            Your data never leaves your device unencrypted.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/workspace">
              <FruityButton variant="gradient" size="lg">
                🚀 Get Started
              </FruityButton>
            </Link>
            <Link href="/templates">
              <FruityButton variant="glass" size="lg">
                📄 Browse Templates
              </FruityButton>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <GlassCard hover>
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
              End-to-End Encrypted
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              AES-256-GCM encryption. Master keys never leave your device. Server sees only encrypted data.
            </p>
          </GlassCard>

          <GlassCard hover>
            <div className="text-4xl mb-4">✍️</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Notion-like Editor
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Rich text editing with markdown support. Headings, lists, code blocks, and more.
            </p>
          </GlassCard>

          <GlassCard hover>
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Self-Hostable
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Own your data completely. Docker-ready deployment with MongoDB and Redis.
            </p>
          </GlassCard>

          <GlassCard hover>
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Smart Organization
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Folders, tags, favorites, and archives. Search on unencrypted metadata.
            </p>
          </GlassCard>

          <GlassCard hover>
            <div className="text-4xl mb-4">📥</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Export Freedom
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Export as Markdown or ZIP. Your data is always portable and accessible.
            </p>
          </GlassCard>

          <GlassCard hover>
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
              Beautiful Design
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Frutiger Aero aesthetics with glass morphism and smooth animations.
            </p>
          </GlassCard>
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>Built with privacy, security, and beauty in mind.</p>
          <p className="mt-2">
            <Link href="/about" className="hover:text-aqua-600 transition-colors">
              Learn More
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
