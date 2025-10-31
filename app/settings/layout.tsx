import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://othello-game.online";

export const metadata: Metadata = {
  title: "Settings - Overturn",
  description:
    "Manage your Overturn account settings, preferences, and privacy options.",
  openGraph: {
    title: "Settings - Overturn",
    description:
      "Manage your Overturn account settings, preferences, and privacy options.",
    url: `${siteUrl}/settings`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Overturn Settings",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Settings - Othello Game",
    description:
      "Manage your Othello game account settings, preferences, and privacy options.",
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: `${siteUrl}/settings`,
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
