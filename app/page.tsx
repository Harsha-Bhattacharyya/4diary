import Link from "next/link";
import FruityBackground from "@/components/ui/FruityBackground";
import FruityButton from "@/components/ui/FruityButton";

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
      <FruityBackground />
      
      {/* Top Bar */}
      <div className="relative z-10 flex justify-between items-center px-6 py-4">
        <div className="text-leather-200 font-semibold">Home Page</div>
        <Link href="/workspace">
          <FruityButton variant="parchment" size="sm">
            Log in
          </FruityButton>
        </Link>
      </div>
      
      <main className="relative z-10 flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-6 py-12">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16 fade-in">
          <h1 className="text-6xl md:text-7xl font-bold text-leather-100 mb-4">
            4Diary
          </h1>
          <p className="text-xl md:text-2xl text-leather-200 mb-8 fade-in-delay-1">
            Catering to your note needs with privacy and style.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 fade-in-delay-2">
            <Link href="/workspace">
              <FruityButton variant="gradient" size="lg">
                Get Started
              </FruityButton>
            </Link>
            <Link href="/docs">
              <FruityButton variant="parchment" size="lg">
                View Docs
              </FruityButton>
            </Link>
          </div>

          {/* Why 4Diary Section */}
          <div className="text-left max-w-2xl mx-auto fade-in-delay-3">
            <h2 className="text-2xl font-bold text-leather-100 mb-6 text-center">
              Why 4Diary?
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-xl font-bold text-leather-200">①</span>
                <p className="text-leather-300">
                  <span className="font-semibold text-leather-200">AES Encryption</span> — secure data
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl font-bold text-leather-200">②</span>
                <p className="text-leather-300">
                  <span className="font-semibold text-leather-200">Server never sees your writing</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl font-bold text-leather-200">③</span>
                <p className="text-leather-300">
                  <span className="font-semibold text-leather-200">Self-hostable</span> — run it yourself
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl font-bold text-leather-200">④</span>
                <p className="text-leather-300">
                  <span className="font-semibold text-leather-200">FLOSS</span> — free, open-source, endless freedom
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-leather-300 text-sm fade-in-delay-2">
          <p>Made with ❤️ in 🇮🇳</p>
        </footer>
      </main>
    </div>
  );
}