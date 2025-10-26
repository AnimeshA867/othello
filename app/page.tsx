import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bot, Users, Globe, Brain, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import {
  StructuredData,
  getWebsiteSchema,
  getGameSchema,
  getOrganizationSchema,
  getFAQSchema,
} from "@/components/structured-data";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://othello-game.online";

export default function HomePage() {
  return (
    <>
      <StructuredData data={getWebsiteSchema(siteUrl)} />
      <StructuredData data={getGameSchema(siteUrl)} />
      <StructuredData data={getOrganizationSchema(siteUrl)} />
      <StructuredData data={getFAQSchema()} />

      <div className="min-h-screen bg-background relative">
        {/* Grid background pattern */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `
               linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), 
               linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
             `,
            backgroundSize: "40px 40px",
          }}
        ></div>
        <Navbar />

        {/* Hero Section */}
        <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="absolute inset-0 opacity-10 hidden md:block">
              <div className="grid grid-cols-8 gap-1 h-full w-full max-w-md mx-auto">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-white/30 aspect-square"
                  />
                ))}
              </div>
            </div>
            <div className="relative z-10">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4 md:mb-6 tracking-tight">
                Play Othello
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
                Master the classic strategy game. Flip your opponent&apos;s
                pieces and dominate the board in this timeless battle of wits.
              </p>
            </div>
          </div>
        </section>

        {/* Game Mode Cards */}
        <section className="py-8 md:py-16 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {/* Play vs AI */}
              <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-border hover:border-accent">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 rounded-full bg-secondary group-hover:bg-primary w-fit transition-all duration-300">
                    <Bot className="h-8 w-8 text-secondary-foreground group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl font-bold text-foreground">
                    Play vs AI
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Challenge our AI and sharpen your skills
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    asChild
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-300"
                  >
                    <Link href="/game/ai">Start Game</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Play with Friend */}
              <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-border hover:border-accent">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 rounded-full bg-secondary group-hover:bg-primary w-fit transition-all duration-300">
                    <Users className="h-8 w-8 text-secondary-foreground group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl font-bold text-foreground">
                    Play with a Friend
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Create or join a private room with a friend
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    asChild
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-300"
                  >
                    <Link href="/game/friend">Create Room</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Play Ranked */}
              <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-border hover:border-accent">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 rounded-full bg-secondary group-hover:bg-primary w-fit transition-all duration-300">
                    <Globe className="h-8 w-8 text-secondary-foreground group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <CardTitle className="text-xl md:text-2xl font-bold text-foreground">
                    Play Ranked
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Test your skills in competitive matches
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    asChild
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-300"
                  >
                    <Link href="/game/ranked">Find Match</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Why Play Section */}
        <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 relative z-10 bg-secondary/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
              Why Play Othello Online?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  Improve Your Strategy
                </h3>
                <p className="text-muted-foreground">
                  Othello sharpens your strategic thinking and pattern
                  recognition skills with every game.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  Quick Matches
                </h3>
                <p className="text-muted-foreground">
                  Games are fast-paced and engaging. Play a quick match anytime,
                  anywhere.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                  <Trophy className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  Compete & Win
                </h3>
                <p className="text-muted-foreground">
                  Challenge yourself in ranked mode and climb the leaderboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto prose prose-invert">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              Play Othello (Reversi) Free Online
            </h2>
            <p className="text-muted-foreground text-lg mb-4">
              Welcome to the ultimate online destination for Othello
              enthusiasts! Whether you're a seasoned strategist or just
              discovering this classic board game, our platform offers the
              perfect environment to play Othello online for free.
            </p>

            <h3 className="text-2xl font-semibold mb-4 mt-8 text-foreground">
              What is Othello?
            </h3>
            <p className="text-muted-foreground mb-4">
              Othello, also known as Reversi, is a timeless strategy board game
              that has captivated players for generations. The game is played on
              an 8x8 board with black and white pieces. The objective is simple
              yet challenging: outflank your opponent's pieces to flip them to
              your color, ultimately controlling the majority of the board when
              the game ends.
            </p>

            <h3 className="text-2xl font-semibold mb-4 mt-8 text-foreground">
              Features of Our Othello Game
            </h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-6">
              <li>
                <strong>AI Opponents:</strong> Practice against intelligent AI
                with multiple difficulty levels
              </li>
              <li>
                <strong>Multiplayer Mode:</strong> Play with friends online in
                private rooms
              </li>
              <li>
                <strong>Ranked Matches:</strong> Compete globally and climb the
                leaderboard
              </li>
              <li>
                <strong>Stunning 3D Graphics:</strong> Enjoy beautiful board
                visualization
              </li>
              <li>
                <strong>Mobile Friendly:</strong> Play on any device - desktop,
                tablet, or smartphone
              </li>
              <li>
                <strong>100% Free:</strong> No registration required, no hidden
                fees
              </li>
            </ul>

            <h3 className="text-2xl font-semibold mb-4 mt-8 text-foreground">
              How to Play Othello
            </h3>
            <p className="text-muted-foreground mb-4">
              Learning Othello is easy, but mastering it takes practice! Each
              player takes turns placing pieces on the board. You must place
              your piece adjacent to an opponent's piece and create a straight
              line (horizontal, vertical, or diagonal) that traps opponent
              pieces between your new piece and another piece of your color. All
              trapped pieces flip to your color!
            </p>
            <p className="text-muted-foreground mb-4">
              The game ends when neither player can make a legal move. The
              player with the most pieces of their color on the board wins.
              Visit our{" "}
              <Link
                href="/how-to-play"
                className="text-primary hover:underline"
              >
                How to Play
              </Link>{" "}
              page for detailed rules and strategies.
            </p>

            <h3 className="text-2xl font-semibold mb-4 mt-8 text-foreground">
              Start Playing Now!
            </h3>
            <p className="text-muted-foreground mb-4">
              Ready to test your strategic skills? Choose your game mode above
              and start playing Othello online right now. No downloads, no
              registration - just pure strategy gaming fun!
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
