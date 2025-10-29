import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://othello-game.online";

export const metadata: Metadata = {
  title: "Roadmap - Othello Master",
  description:
    "See what's coming next for Othello Master! View our development roadmap, upcoming features, and planned improvements.",
  openGraph: {
    title: "Roadmap - Othello Master",
    description:
      "See what's coming next for Othello Master! View our development roadmap, upcoming features, and planned improvements.",
    url: `${siteUrl}/roadmap`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Othello Master Roadmap",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Roadmap - Othello Game",
    description:
      "See what's coming next for Othello Game! View our development roadmap, upcoming features, and planned improvements.",
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: `${siteUrl}/roadmap`,
  },
};

export default function RoadmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
