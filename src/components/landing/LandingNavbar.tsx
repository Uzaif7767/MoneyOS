"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { LogoIcon } from "@/components/ui/icons";

interface LandingNavbarProps {
  userId?: string | null;
}

export function LandingNavbar({ userId }: LandingNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 shadow-lg shadow-black/20 py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:border-emerald-500/40 transition-all">
              <LogoIcon className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Money<span className="text-emerald-400">OS</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a
              href="#features"
              className="hover:text-emerald-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#safe-to-spend"
              className="hover:text-emerald-400 transition-colors"
            >
              Safe-to-Spend
            </a>
            <a
              href="#how-it-works"
              className="hover:text-emerald-400 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#previews"
              className="hover:text-emerald-400 transition-colors"
            >
              Product Tour
            </a>
            <a
              href="#trust"
              className="hover:text-emerald-400 transition-colors"
            >
              Security
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {!userId ? (
              <>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4.5 py-2 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm shadow-emerald-950/30 transition-all cursor-pointer">
                    Get Started
                  </button>
                </SignUpButton>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <UserButton showName={false} />
                <Link
                  href="/protected"
                  className="px-4.5 py-2 text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm shadow-emerald-950/30 transition-all"
                >
                  Go to Dashboard →
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            {userId && <UserButton showName={false} />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white rounded-lg border border-slate-800 bg-slate-900/50"
              aria-label="Toggle navigation menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 pb-4 border-t border-slate-800/80 space-y-3 bg-slate-950/95 backdrop-blur-xl rounded-xl p-4 shadow-xl border">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-emerald-400 font-medium"
            >
              Features
            </a>
            <a
              href="#safe-to-spend"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-emerald-400 font-medium"
            >
              Safe-to-Spend
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-emerald-400 font-medium"
            >
              How It Works
            </a>
            <a
              href="#previews"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-emerald-400 font-medium"
            >
              Product Tour
            </a>
            <a
              href="#trust"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-300 hover:text-emerald-400 font-medium"
            >
              Security
            </a>

            <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
              {!userId ? (
                <>
                  <SignInButton mode="modal">
                    <button className="w-full py-2.5 text-center text-sm font-medium text-slate-200 bg-slate-900 border border-slate-800 rounded-lg">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="w-full py-2.5 text-center text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg">
                      Get Started
                    </button>
                  </SignUpButton>
                </>
              ) : (
                <Link
                  href="/protected"
                  className="w-full py-2.5 text-center text-sm font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg block"
                >
                  Go to Dashboard →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
