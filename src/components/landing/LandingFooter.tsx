"use client";

import React from "react";
import Link from "next/link";
import { LogoIcon } from "@/components/ui/icons";

export function LandingFooter() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <LogoIcon className="w-5 h-5 text-emerald-400" />
              <span className="text-lg font-bold text-white tracking-tight">
                Money<span className="text-emerald-400">OS</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              Smart personal money management. Understand your spending, plan ahead with confidence, and know what you can safely spend every day.
            </p>
            <div className="text-[11px] text-slate-500">
              Built with Next.js & Clerk Authentication.
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-white uppercase tracking-wider">Product</div>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="hover:text-emerald-400 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#safe-to-spend" className="hover:text-emerald-400 transition-colors">
                  Safe-to-Spend
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#previews" className="hover:text-emerald-400 transition-colors">
                  Product Tour
                </a>
              </li>
            </ul>
          </div>

          {/* Security & Access Links */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-white uppercase tracking-wider">Account & Access</div>
            <ul className="space-y-2">
              <li>
                <a href="#trust" className="hover:text-emerald-400 transition-colors">
                  Privacy & Security
                </a>
              </li>
              <li>
                <Link href="/sign-in" className="hover:text-emerald-400 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-emerald-400 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/protected" className="hover:text-emerald-400 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} MoneyOS. All rights reserved. Personal Money Management System.
          </div>
          <div className="flex items-center gap-4">
            <span>₹ INR Currency Format</span>
            <span>•</span>
            <span>Clerk Auth Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
