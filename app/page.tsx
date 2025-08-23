import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bot, Users, Globe } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
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
                <div key={i} className="border border-white/30 aspect-square" />
              ))}
            </div>
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4 md:mb-6 tracking-tight">
              Play Othello
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed">
              Master the classic strategy game. Flip your opponent&apos;s pieces
              and dominate the board in this timeless battle of wits.
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
    </div>
  );
}
