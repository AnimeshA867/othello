import type React from "react";

interface StructuredDataProps {
  data: Record<string, unknown>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function getWebsiteSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Othello Online",
    alternateName: ["Reversi Online", "Play Othello"],
    url: siteUrl,
    description:
      "Play Othello (Reversi) online for free! Challenge AI opponents, play with friends, or compete in ranked matches.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/game?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-US",
  };
}

export function getGameSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Game",
    name: "Othello",
    alternateName: "Reversi",
    description:
      "Othello, also known as Reversi, is a classic strategy board game for two players. Flip your opponent's pieces by trapping them between your own pieces.",
    gameItem: {
      "@type": "Thing",
      name: "Othello Board Game",
    },
    numberOfPlayers: {
      "@type": "QuantitativeValue",
      minValue: 1,
      maxValue: 2,
    },
    playMode: ["SinglePlayer", "MultiPlayer", "CoOp"],
    applicationCategory: "Game",
    url: `${siteUrl}/game`,
    genre: ["Strategy", "Board Game"],
    gamePlatform: ["Web Browser", "Desktop", "Mobile"],
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
      bestRating: "5",
      worstRating: "1",
    },
  };
}

export function getOrganizationSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Othello Online",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    sameAs: [
      // Add your social media profiles here
      // "https://twitter.com/othelloonline",
      // "https://www.facebook.com/othelloonline",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: "English",
    },
  };
}

export function getBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function getHowToSchema(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Play Othello (Reversi)",
    description:
      "Learn the rules and strategies of Othello, also known as Reversi, a classic strategy board game.",
    image: `${siteUrl}/how-to-play-image.png`,
    totalTime: "PT5M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: "0",
    },
    step: [
      {
        "@type": "HowToStep",
        name: "Setup the Board",
        text: "Place two black and two white pieces in the center of the 8x8 board in a diagonal pattern.",
        position: 1,
      },
      {
        "@type": "HowToStep",
        name: "Make Your Move",
        text: "Place a piece on the board that traps one or more of your opponent's pieces between your new piece and another one of your pieces.",
        position: 2,
      },
      {
        "@type": "HowToStep",
        name: "Flip the Pieces",
        text: "All trapped opponent pieces are flipped to your color.",
        position: 3,
      },
      {
        "@type": "HowToStep",
        name: "Win the Game",
        text: "The player with the most pieces of their color on the board when no more moves are possible wins.",
        position: 4,
      },
    ],
  };
}

export function getFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Othello?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Othello, also known as Reversi, is a classic strategy board game for two players. Players take turns placing pieces on an 8x8 board, flipping opponent pieces by trapping them between their own pieces.",
        },
      },
      {
        "@type": "Question",
        name: "How do you win at Othello?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You win Othello by having the most pieces of your color on the board when the game ends. The game ends when both players have no legal moves remaining.",
        },
      },
      {
        "@type": "Question",
        name: "Can I play Othello for free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Our Othello game is completely free to play online. You can play against AI, friends, or in ranked matches without any cost.",
        },
      },
      {
        "@type": "Question",
        name: "What's the difference between Othello and Reversi?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Othello and Reversi are essentially the same game with minor differences in starting position. The terms are often used interchangeably, with Othello being the trademarked name.",
        },
      },
      {
        "@type": "Question",
        name: "Can I play Othello on mobile?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Our Othello game is fully responsive and works on all devices including smartphones, tablets, and desktop computers.",
        },
      },
    ],
  };
}
