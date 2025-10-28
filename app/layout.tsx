import type React from "react";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../stack/client";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleAnalytics, MicrosoftClarity } from "@/components/analytics";
import { AuthProvider } from "@/components/auth-provider";
import StoreProvider from "@/lib/redux/StoreProvider";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://othello-wine.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "Othello Online - Play Free Reversi | Classic Black and White Strategy Board Game",
    template: "%s | Othello Online",
  },
  description:
    "Play Othello (Reversi) online for free! The classic black and white strategy board game. Challenge AI opponents, play with friends, or compete in ranked matches. Master the timeless disc-flipping board game with intuitive 3D graphics and real-time multiplayer. Perfect for beginners and experts alike.",
  keywords: [
    // Core game names
    "othello",
    "reversi",
    "othello game",
    "reversi game",
    "othello online",
    "reversi online",
    "play othello",
    "play reversi",

    // Black and white board game keywords
    "black and white board game",
    "black white strategy game",
    "disc game",
    "disk game",
    "flip disc game",
    "disc flipping game",
    "two color board game",

    // Strategy and classic keywords
    "strategy game",
    "board game",
    "classic board game",
    "strategy board game",
    "abstract strategy game",
    "two player game",
    "classic strategy game",
    "traditional board game",

    // Game modes
    "othello ai",
    "multiplayer othello",
    "online othello",
    "ranked othello",
    "competitive othello",
    "othello with friends",

    // Related searches
    "free game",
    "online game",
    "brain game",
    "logic game",
    "puzzle game",
    "mind game",
    "thinking game",
    "tactical game",

    // Platform keywords
    "web game",
    "browser game",
    "no download game",
    "instant play game",

    // Skill level
    "easy to learn",
    "hard to master",
    "beginner friendly",
    "expert level",
  ],
  authors: [{ name: "Othello Online" }],
  creator: "Othello Online",
  publisher: "Othello Online",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title:
      "Othello Online - Free Black and White Strategy Board Game | Reversi",
    description:
      "Play the classic Othello (Reversi) board game online for free! Strategic black and white disc-flipping game. Challenge AI, play with friends, or compete in ranked matches. No download required - play instantly in your browser!",
    siteName: "Othello Online",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Othello Online - Classic Black and White Strategy Board Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Othello Online - Free Black and White Strategy Board Game",
    description:
      "Play Othello (Reversi) online for free! The classic black and white disc-flipping strategy game. Challenge AI or compete with players worldwide.",
    images: [`${siteUrl}/og-image.png`],
    creator: "@othelloonline",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
  },
  other: {
    "msvalidate.01": process.env.NEXT_PUBLIC_BING_VERIFICATION || "",
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "games",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Othello Online",
    alternateName: ["Reversi Online", "Othello Game", "Reversi Game"],
    url: siteUrl,
    description:
      "Play Othello (Reversi) online for free! The classic black and white strategy board game. Challenge AI opponents, play with friends, or compete in ranked matches.",
    applicationCategory: "Game",
    gameType: "Strategy",
    genre: "Board Game",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Play against AI with multiple difficulty levels",
      "Multiplayer mode with friends",
      "Ranked competitive matches",
      "Real-time matchmaking",
      "ELO rating system",
      "3D game board graphics",
      "Mobile-friendly interface",
      "No download required",
    ],
    screenshot: `${siteUrl}/og-image.png`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
    },
    author: {
      "@type": "Organization",
      name: "Othello Online",
    },
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <StoreProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem={false}
                disableTransitionOnChange
              >
                <AuthProvider>
                  <GoogleAnalytics />
                  <MicrosoftClarity />
                  {children}
                  <Toaster />
                </AuthProvider>
              </ThemeProvider>
            </StoreProvider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
