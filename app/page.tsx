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
import { Bot, Users, Trophy, Gamepad2, Zap, Brain } from "lucide-react";

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

            <div className="flex items-center gap-4">
              <Badge
                variant="secondary"
                className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 px-3 py-1"
              >
                <Zap className="w-4 h-4 mr-1" />
                Online
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-6xl font-bold text-white mb-6">
            Play Othello Online
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Master the classic strategy game of Othello. Challenge the AI or
            play with friends in this beautifully crafted modern interface.
          </p>

          {/* Game Stats */}
          <div className="flex items-center justify-center gap-12 mb-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-400">1,247</div>
              <div className="text-slate-400 text-sm">Games Today</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-400">89</div>
              <div className="text-slate-400 text-sm">Playing Now</div>
            </div>
          </div>
        </div>

        {/* Game Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Play vs AI */}
          <Card className="bg-slate-800/60 border-slate-600 hover:border-slate-500 transition-all duration-300 group backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">Play vs AI</CardTitle>
              <CardDescription className="text-slate-300">
                Challenge our intelligent AI with multiple difficulty levels
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center gap-2 mb-6">
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                >
                  Easy
                </Badge>
                <Badge
                  variant="outline"
                  className="border-blue-500/40 text-blue-300 bg-blue-500/10"
                >
                  Medium
                </Badge>
                <Badge
                  variant="outline"
                  className="border-red-500/40 text-red-300 bg-red-500/10"
                >
                  Hard
                </Badge>
              </div>
              <Link href="/game/ai">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 shadow-lg"
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Start AI Game
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Play vs Friend */}
          <Card className="bg-slate-800/60 border-slate-600 hover:border-slate-500 transition-all duration-300 group backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">
                Play vs Friend
              </CardTitle>
              <CardDescription className="text-slate-300">
                Create a private room and invite a friend to play
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center gap-2 mb-6">
                <Badge
                  variant="outline"
                  className="border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                >
                  Real-time
                </Badge>
                <Badge
                  variant="outline"
                  className="border-blue-500/40 text-blue-300 bg-blue-500/10"
                >
                  Private Room
                </Badge>
              </div>
              <Link href="/game/friend">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold py-3 shadow-lg"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Play with Friend
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <Card className="bg-slate-800/40 border-slate-600 text-center backdrop-blur-sm">
            <CardContent className="pt-6">
              <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Track Progress
              </h3>
              <p className="text-slate-300 text-sm">
                Monitor your wins, losses, and improvement over time
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border-slate-600 text-center backdrop-blur-sm">
            <CardContent className="pt-6">
              <Zap className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Fast & Smooth
              </h3>
              <p className="text-slate-300 text-sm">
                Optimized for speed with beautiful animations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/40 border-slate-600 text-center backdrop-blur-sm">
            <CardContent className="pt-6">
              <Brain className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Smart AI
              </h3>
              <p className="text-slate-300 text-sm">
                Advanced AI using minimax algorithm with alpha-beta pruning
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="text-center">
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white backdrop-blur-sm"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </Button>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white backdrop-blur-sm"
            >
              View Profile
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
