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
        <div className="max-w-6xl mx-auto text-center mb-16 fade-in">
        <img src="4diary.png" alt="logo" > 
	<p className="text-2xl md:text-3xl font-bold text-leather-200 mb-4 fade-in-delay-1">
            Privacy-First Note-Taking
          </p>
          <p className="text-lg text-leather-300 max-w-2xl mx-auto mb-8 fade-in-delay-2">
            Your thoughts, encrypted end-to-end. A beautiful, Notion-like editor with military-grade encryption. 
            Your data never leaves your device unencrypted.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center fade-in-delay-3">
            <Link href="/workspace">
              <FruityButton variant="gradient" size="lg">
                🚀 Get Started
              </FruityButton>
            </Link>
            <Link href="/templates">
              <FruityButton variant="parchment" size="lg">
                📄 Browse Templates
              </FruityButton>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <GlassCard hover className="fade-in">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold mb-2 text-leather-100">
              End-to-End Encrypted
            </h3>
            <p className="text-leather-300">
              AES-256-GCM encryption. Master keys never leave your device. Server sees only encrypted data.
            </p>
          </GlassCard>

          <GlassCard hover className="fade-in-delay-1">
            <div className="text-4xl mb-4">✍️</div>
            <h3 className="text-xl font-bold mb-2 text-leather-100">
              Notion-like Editor
            </h3>
            <p className="text-leather-300">
              Rich text editing with markdown support. Headings, lists, code blocks, and more.
            </p>
          </GlassCard>

          <GlassCard hover className="fade-in-delay-2">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold mb-2 text-leather-100">
              Self-Hostable
            </h3>
            <p className="text-leather-300">
              Own your data completely. Docker-ready deployment with MongoDB and Redis.
            </p>
          </GlassCard>

          <GlassCard hover className="fade-in-delay-3">
            <div className="text-4xl mb-4">📁</div>
            <h3 className="text-xl font-bold mb-2 text-leather-100">
              Smart Organization
            </h3>
            <p className="text-leather-300">
              Folders, tags, favorites, and archives. Search on unencrypted metadata.
            </p>
          </GlassCard>

          <GlassCard hover className="fade-in">
            <div className="text-4xl mb-4">📥</div>
            <h3 className="text-xl font-bold mb-2 text-leather-100">
              Export Freedom
            </h3>
            <p className="text-leather-300">
              Export as Markdown or ZIP. Your data is always portable and accessible.
            </p>
          </GlassCard>

          <GlassCard hover className="fade-in-delay-1">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-2 text-leather-100">
              Beautiful Design
            </h3>
            <p className="text-leather-300">
              Old leather aesthetics with archaic fonts and smooth fade-in animations.
            </p>
          </GlassCard>
        </div>

        {/* Footer */}
        <footer className="text-center text-leather-300 text-sm fade-in-delay-2">
          <p>Built with privacy, security, and timeless elegance in mind.</p>
          <p className="mt-2">
            <Link href="/about" className="hover:text-leather-100 transition-colors">
              Learn More
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
