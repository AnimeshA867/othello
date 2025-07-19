"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Users,
  Trophy,
  BarChart3,
  Gamepad2,
  MessageCircle,
  Globe,
  Zap,
  Star,
  Calendar,
} from "lucide-react";

export default function RoadmapPage() {
  const upcomingFeatures = [
    {
      title: "Multiplayer Mode",
      description:
        "Real-time multiplayer with room-based matchmaking and WebSocket connections",
      icon: Users,
      priority: "High",
      status: "In Development",
      features: [
        "Real-time gameplay synchronization",
        "Private room creation with codes",
        "Spectator mode for watching games",
        "Friend invitation system",
      ],
    },
    {
      title: "Statistics & Analytics",
      description: "Comprehensive player statistics and performance tracking",
      icon: BarChart3,
      priority: "Medium",
      status: "Planned",
      features: [
        "Win/loss ratio tracking",
        "Performance over time charts",
        "AI difficulty progression",
        "Move analysis and insights",
      ],
    },
    {
      title: "Leaderboards",
      description: "Global and local leaderboards with ranking systems",
      icon: Trophy,
      priority: "Medium",
      status: "Planned",
      features: [
        "Global player rankings",
        "Monthly leaderboards",
        "Achievement system",
        "Skill rating (ELO-like system)",
      ],
    },
    {
      title: "Chat System",
      description: "In-game messaging and communication features",
      icon: MessageCircle,
      priority: "Low",
      status: "Future",
      features: [
        "Real-time chat during games",
        "Emote system",
        "Quick message templates",
        "Chat moderation tools",
      ],
    },
    {
      title: "Tournaments",
      description: "Organized tournaments and competitive play",
      icon: Calendar,
      priority: "Low",
      status: "Future",
      features: [
        "Bracket-style tournaments",
        "Automated scheduling",
        "Prize tracking",
        "Tournament history",
      ],
    },
    {
      title: "Advanced AI Features",
      description: "Enhanced AI capabilities and training modes",
      icon: Zap,
      priority: "Medium",
      status: "Planned",
      features: [
        "AI personality variants",
        "Training mode with hints",
        "Move suggestion system",
        "AI difficulty auto-adjustment",
      ],
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "border-red-500/40 text-red-300 bg-red-500/10";
      case "Medium":
        return "border-yellow-500/40 text-yellow-300 bg-yellow-500/10";
      case "Low":
        return "border-green-500/40 text-green-300 bg-green-500/10";
      default:
        return "border-slate-500/40 text-slate-300 bg-slate-500/10";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Development":
        return "border-blue-500/40 text-blue-300 bg-blue-500/10";
      case "Planned":
        return "border-purple-500/40 text-purple-300 bg-purple-500/10";
      case "Future":
        return "border-slate-500/40 text-slate-300 bg-slate-500/10";
      default:
        return "border-slate-500/40 text-slate-300 bg-slate-500/10";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700">
      {/* Header */}
      <header className="border-b border-slate-600/50 bg-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-slate-200 hover:bg-slate-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400" />
                Roadmap & Future Features
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            What's Coming Next
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Explore our planned features and upcoming enhancements to make
            Othello Master even better
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {upcomingFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="bg-slate-800/60 border-slate-600 hover:border-slate-500 transition-all duration-300 backdrop-blur-sm"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white">
                          {feature.title}
                        </CardTitle>
                        <p className="text-slate-300 text-sm mt-1">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Badge
                      variant="outline"
                      className={getPriorityColor(feature.priority)}
                    >
                      {feature.priority} Priority
                    </Badge>
                    <Badge
                      variant="outline"
                      className={getStatusColor(feature.status)}
                    >
                      {feature.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-white mb-3">
                      Planned Features:
                    </h4>
                    {feature.features.map((subFeature, subIndex) => (
                      <div
                        key={subIndex}
                        className="flex items-center gap-2 text-sm text-slate-300"
                      >
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        {subFeature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Current Status */}
        <div className="mt-16 text-center">
          <Card className="bg-slate-800/60 border-slate-600 max-w-2xl mx-auto backdrop-blur-sm">
            <CardContent className="p-8">
              <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">
                Stay Updated
              </h3>
              <p className="text-slate-300 mb-6">
                This roadmap is updated regularly. Features may be added,
                modified, or reprioritized based on user feedback and
                development progress.
              </p>
              <Link href="/">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3"
                >
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Play Current Version
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
