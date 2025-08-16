"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spotlight } from "@/components/ui/spotlight";
import {
  Bot,
  Trophy,
  Gamepad2,
  Zap,
  Brain,
  RotateCcw,
  Users,
  ShieldCheck,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 relative overflow-hidden">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />

      {/* Header */}
      <header className="border-b border-slate-600/50 bg-slate-800/50 backdrop-blur-sm relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Gamepad2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Othello Master
                </h1>
                <p className="text-slate-300 text-sm">
                  Play the classic strategy game
                </p>
              </div>
            </div>

            <Link href="/roadmap">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-300 hover:text-white hover:bg-slate-700"
              >
                Roadmap
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Master Othello
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Experience the classic strategy game with modern features. Challenge
            our intelligent AI, play with friends, or compete in ranked matches.
          </p>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">3</div>
              <div className="text-slate-400 text-sm">Difficulty Levels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                <Users className="h-6 w-6 mx-auto" />
              </div>
              <div className="text-slate-400 text-sm">Multiplayer</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                <Trophy className="h-6 w-6 mx-auto" />
              </div>
              <div className="text-slate-400 text-sm">Ranked Matches</div>
            </div>
          </div>
        </div>

        {/* Game Mode Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {/* AI Mode Card */}
          <Card className="bg-slate-800/60 border-slate-600 hover:border-slate-500 transition-all duration-300 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-white mb-2">
                Challenge the AI
              </CardTitle>
              <CardDescription className="text-slate-300">
                Test your strategy against our intelligent AI opponent across
                three difficulty levels
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <div className="flex justify-center gap-3 mb-6">
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 text-emerald-300 bg-emerald-500/10 px-3 py-1"
                >
                  Easy
                </Badge>
                <Badge
                  variant="outline"
                  className="border-blue-500/40 text-blue-300 bg-blue-500/10 px-3 py-1"
                >
                  Medium
                </Badge>
                <Badge
                  variant="outline"
                  className="border-red-500/40 text-red-300 bg-red-500/10 px-3 py-1"
                >
                  Hard
                </Badge>
              </div>
              <Link href="/game/ai">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-2 shadow-lg">
                  <Brain className="w-5 h-5 mr-2" />
                  Play vs AI
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Ranked Mode Card */}
          <Card className="bg-slate-800/60 border-slate-600 hover:border-slate-500 transition-all duration-300 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-white mb-2">
                Ranked Matchmaking
              </CardTitle>
              <CardDescription className="text-slate-300">
                Compete against other players in skill-based matchmaking and
                climb the ranks
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <div className="flex justify-center gap-3 mb-6">
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 text-emerald-300 bg-emerald-500/10 px-3 py-1"
                >
                  Beginner
                </Badge>
                <Badge
                  variant="outline"
                  className="border-blue-500/40 text-blue-300 bg-blue-500/10 px-3 py-1"
                >
                  Intermediate
                </Badge>
                <Badge
                  variant="outline"
                  className="border-purple-500/40 text-purple-300 bg-purple-500/10 px-3 py-1"
                >
                  Advanced
                </Badge>
              </div>
              <Link href="/game/ranked">
                <Button className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white font-semibold px-8 py-2 shadow-lg">
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Play Ranked
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Friend Mode Card */}
          <Card className="bg-slate-800/60 border-slate-600 hover:border-slate-500 transition-all duration-300 backdrop-blur-sm md:col-span-2 max-w-md mx-auto">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Users className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-white mb-2">
                Play with a Friend
              </CardTitle>
              <CardDescription className="text-slate-300">
                Create a private room and invite a friend to play
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <Link href="/game/friend">
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-8 py-2 shadow-lg">
                  <Users className="w-5 h-5 mr-2" />
                  Create Private Room
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
          <Card className="bg-slate-800/40 border-slate-600 text-center backdrop-blur-sm hover:bg-slate-800/50 transition-all">
            <CardContent className="pt-8 pb-6">
              <Brain className="w-10 h-10 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Smart AI
              </h3>
              <p className="text-slate-300 text-sm">
                Advanced minimax algorithm with alpha-beta pruning
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border-slate-600 text-center backdrop-blur-sm hover:bg-slate-800/50 transition-all">
            <CardContent className="pt-8 pb-6">
              <Users className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Multiplayer
              </h3>
              <p className="text-slate-300 text-sm">
                Play with friends or ranked matchmaking
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border-slate-600 text-center backdrop-blur-sm hover:bg-slate-800/50 transition-all">
            <CardContent className="pt-8 pb-6">
              <Zap className="w-10 h-10 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Fast & Smooth
              </h3>
              <p className="text-slate-300 text-sm">
                Optimized performance with beautiful animations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border-slate-600 text-center backdrop-blur-sm hover:bg-slate-800/50 transition-all">
            <CardContent className="pt-8 pb-6">
              <RotateCcw className="w-10 h-10 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Undo System
              </h3>
              <p className="text-slate-300 text-sm">
                Smart undo with difficulty-based limits
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-slate-800/40 border border-slate-600 rounded-xl p-8 max-w-2xl mx-auto backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Master Othello?
            </h3>
            <p className="text-slate-300 mb-6">
              Choose your game mode and start playing now
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/game/ai">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 shadow-lg">
                  <Bot className="w-5 h-5 mr-2" />
                  Play vs AI
                </Button>
              </Link>
              <Link href="/game/ranked">
                <Button className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white font-semibold px-6 py-2 shadow-lg">
                  <Trophy className="w-5 h-5 mr-2" />
                  Ranked Match
                </Button>
              </Link>
              <Link href="/game/friend">
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-6 py-2 shadow-lg">
                  <Users className="w-5 h-5 mr-2" />
                  Play with Friend
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-600/50 bg-slate-800/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Gamepad2 className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  Othello Master
                </h3>
              </div>
              <p className="text-slate-300 text-sm">
                A modern implementation of the classic Othello strategy game
                with AI opponents and smooth gameplay.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Links
              </h3>
              <div className="space-y-2">
                <Link
                  href="/game/ai"
                  className="block text-slate-300 hover:text-white transition-colors text-sm"
                >
                  Play vs AI
                </Link>
                <Link
                  href="/game/ranked"
                  className="block text-slate-300 hover:text-white transition-colors text-sm"
                >
                  Ranked Matches
                </Link>
                <Link
                  href="/game/friend"
                  className="block text-slate-300 hover:text-white transition-colors text-sm"
                >
                  Play with Friend
                </Link>
                <Link
                  href="/roadmap"
                  className="block text-slate-300 hover:text-white transition-colors text-sm"
                >
                  Roadmap
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Game Features
              </h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div>• Three AI difficulty levels</div>
                <div>• Multiplayer with friends</div>
                <div>• Ranked matchmaking</div>
                <div>• Smart undo system</div>
                <div>• Smooth animations</div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-600/50 mt-8 pt-6 text-center">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Othello Master. Built with Next.js
              and TypeScript.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
