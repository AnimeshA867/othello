import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Othello - Classic Strategy Game",
  description:
    "Play the classic Othello strategy game online. Challenge AI, friends, or random opponents.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <body className="font-sans antialiased">
          {children}
          <Toaster />
        </body>
      </ThemeProvider>
    </html>
  );
}
