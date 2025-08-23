"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-black text-white shadow-lg border-b border-gray-800 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold tracking-tight text-white hover:text-gray-300 transition-colors duration-300"
            >
              Othello
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {/* <Link
                href="/"
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all duration-300",
                  "hover:bg-white hover:text-black transform hover:scale-105",
                  pathname === "/" ? "bg-white text-black" : "text-white"
                )}
              >
                Play
              </Link> */}
              <Link
                href="/how-to-play"
                className={cn(
                  "px-4 py-2 rounded-md text-sm font-medium transition-all duration-300",
                  "hover:bg-white hover:text-black transform hover:scale-105",
                  pathname === "/how-to-play"
                    ? "bg-white text-black"
                    : "text-white"
                )}
              >
                How to Play
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-white hover:text-gray-300 transition-colors duration-300">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
