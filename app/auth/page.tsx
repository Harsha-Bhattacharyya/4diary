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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const generateSecurePassword = () => {
    const length = 16;
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
    const allChars = uppercase + lowercase + numbers + symbols;
    
    let password = "";
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    setPassword(newPassword);
    setShowPasswordGenerator(false);
  };

  const handleCopyPassword = async () => {
    if (password) {
      await navigator.clipboard.writeText(password);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate username has no spaces
    if (username.includes(" ")) {
      setError("Username cannot contain spaces");
      return;
    }
    
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
      const body = isLogin
        ? { username, password }
        : { username, password, name: name || username };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        if (isLogin && response.status === 429) {
          throw new Error("Too many failed attempts. Please try again later.");
        }
        throw new Error(data.error || "Authentication failed");
      }

      // Redirect to workspace on success
      router.push("/workspace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      if (isLogin) {
        setFailedAttempts(prev => prev + 1);
      }
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
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-leather-200 mb-2">
                Username <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                required
                pattern="[^\s]+"
                className="w-full px-4 py-2 bg-black/30 border border-leather-300/30 rounded-lg text-leather-100 placeholder-leather-400 focus:outline-none focus:ring-2 focus:ring-leather-300/50"
                placeholder="username"
                title="Username cannot contain spaces"
              />
              <p className="mt-1 text-xs text-leather-400">
                No spaces allowed
              </p>
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
                  className="w-full px-4 py-2 bg-black/30 border border-leather-300/30 rounded-lg text-leather-100 placeholder-leather-400 focus:outline-none focus:ring-2 focus:ring-leather-300/50 pr-20"
                  placeholder="••••••••"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                  {!isLogin && (
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-leather-300 hover:text-leather-100 transition-colors"
                      title="Generate secure password"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-leather-300 hover:text-leather-100 transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {!isLogin && password && (
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="mt-2 text-xs text-leather-300 hover:text-leather-100"
                >
                  📋 Copy password
                </button>
              )}
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
                  # Note → if no name is provided, it is taken from username
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