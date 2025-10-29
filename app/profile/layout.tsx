import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://othello-game.online";

export const metadata: Metadata = {
  title: "Profile - Othello Master",
  description:
    "View your Othello Master profile, stats, achievements, and match history. Track your progress and improve your skills.",
  openGraph: {
    title: "Profile - Othello Master",
    description:
      "View your Othello Master profile, stats, achievements, and match history. Track your progress and improve your skills.",
    url: `${siteUrl}/profile`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Othello Master Profile",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Profile - Othello Game",
    description:
      "View your Othello game profile, stats, achievements, and match history. Track your progress and improve your skills.",
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: `${siteUrl}/profile`,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
