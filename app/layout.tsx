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
  process.env.NEXT_PUBLIC_SITE_URL || "https://othello-game.online";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Othello Online - Play Free Classic Strategy Board Game | Reversi",
    template: "%s | Othello Online",
  },
  description:
    "Play Othello (Reversi) online for free! Challenge AI opponents, play with friends, or compete in ranked matches. Master the classic strategy board game with our intuitive interface and 3D graphics.",
  keywords: [
    "othello",
    "reversi",
    "board game",
    "strategy game",
    "online game",
    "free game",
    "othello online",
    "reversi online",
    "play othello",
    "othello ai",
    "multiplayer othello",
    "classic board game",
    "strategy board game",
    "two player game",
    "brain game",
    "logic game",
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
    title: "Othello Online - Play Free Classic Strategy Board Game",
    description:
      "Play Othello (Reversi) online for free! Challenge AI, play with friends, or compete in ranked matches. Master the classic strategy board game.",
    siteName: "Othello Online",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Othello Online - Classic Strategy Board Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Othello Online - Play Free Classic Strategy Board Game",
    description:
      "Play Othello (Reversi) online for free! Challenge AI, play with friends, or compete in ranked matches.",
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
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
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
