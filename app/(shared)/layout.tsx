import GameNavbar from "@/components/game-navbar";
import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://othello-game.online";

export const metadata: Metadata = {
  title: "Play Othello Game Online",
  description:
    "Play Othello (Reversi) online at Othello Master. Choose from AI opponents, multiplayer with friends, or ranked competitive matches.",
  openGraph: {
    title: "Play Othello Game Online",
    description:
      "Play Othello (Reversi) online at Othello Master. Choose from AI opponents, multiplayer with friends, or ranked competitive matches.",
    url: `${siteUrl}/game`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Othello Master - Play Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Play Othello Game Online",
    description:
      "Play Othello (Reversi) online. Choose from AI opponents, multiplayer with friends, or ranked competitive matches.",
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: `${siteUrl}/game`,
  },
};

const SharedLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="min-h-screen flex flex-col">{children}</div>;
};

export default SharedLayout;
