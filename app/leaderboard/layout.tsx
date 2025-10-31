import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://othello-game.online";

export const metadata: Metadata = {
  title: "Leaderboard - Top Othello Players",
  description:
    "View the top Othello players at Overturn ranked by ELO rating. See win rates, total games played, and compete to climb the global leaderboard.",
  openGraph: {
    title: "Leaderboard - Top Othello Players",
    description:
      "View the top Othello players at Overturn ranked by ELO rating. See win rates, total games played, and compete to climb the global leaderboard.",
    url: `${siteUrl}/leaderboard`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Overturn Leaderboard - Top Players",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Leaderboard - Top Othello Players",
    description:
      "View the top Othello players ranked by ELO rating. See win rates, total games played, and compete to climb the global leaderboard.",
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: `${siteUrl}/leaderboard`,
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
