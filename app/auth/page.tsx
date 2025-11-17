"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LeatherBackground from "@/components/ui/LeatherBackground";
import GlassCard from "@/components/ui/GlassCard";
import LeatherButton from "@/components/ui/LeatherButton";
import Link from "next/link";

/**
 * Authentication page component that displays and manages login and signup forms.
 *
 * Shows either a login or signup form (toggleable), validates inputs, displays server or client-side errors,
 * and redirects to the workspace on successful authentication.
 *
 * @returns The rendered authentication page as a JSX.Element
 */
export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const body = isLogin
        ? { email, password }
        : { email, password, name: name || email.split("@")[0] };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Redirect to workspace on success
      router.push("/workspace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <LeatherBackground />
      
      <GlassCard className="relative z-10 w-full max-w-md">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-center mb-6 text-leather-100">
            {isLogin ? "Log In" : "Sign Up"}
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-leather-200 mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-black/30 border border-leather-300/30 rounded-lg text-leather-100 placeholder-leather-400 focus:outline-none focus:ring-2 focus:ring-leather-300/50"
                placeholder="your@email.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-leather-200 mb-2">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-2 bg-black/30 border border-leather-300/30 rounded-lg text-leather-100 placeholder-leather-400 focus:outline-none focus:ring-2 focus:ring-leather-300/50 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-leather-300 hover:text-leather-100"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Name Field (Signup only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-leather-200 mb-2">
                  Name <span className="text-leather-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-black/30 border border-leather-300/30 rounded-lg text-leather-100 placeholder-leather-400 focus:outline-none focus:ring-2 focus:ring-leather-300/50"
                  placeholder="Your name"
                />
                <p className="mt-1 text-xs text-leather-400">
                  # Note → if no name is provided, it is taken from email
                </p>
              </div>
            )}

            {/* Terms Checkbox (Signup only) */}
            {!isLogin && (
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  required
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-leather-200">
                  I agree to the{" "}
                  <Link
                    href="/CODE_OF_CONDUCT.md"
                    className="text-leather-300 hover:underline"
                    target="_blank"
                  >
                    privacy CoC (commitment)
                  </Link>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <LeatherButton
              type="submit"
              variant="leather"
              className="w-full"
              disabled={loading || (!isLogin && !agreeToTerms)}
            >
              {loading ? "..." : "Enter"}
            </LeatherButton>
          </form>

          {/* Toggle Login/Signup */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm text-leather-300 hover:text-leather-100"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Log in"}
            </button>
          </div>

          {/* Encryption Notice */}
          <div className="mt-6 pt-6 border-t border-leather-300/20 text-center">
            <p className="text-xs text-leather-400">
              🔐 End-to-end encrypted • Zero-knowledge architecture
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}