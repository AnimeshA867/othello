"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Users, Clock, Rocket, Wifi } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FriendGamePage() {
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
                <Users className="w-6 h-6" />
                Multiplayer Othello
              </h1>
            </div>

            <Badge
              variant="outline"
              className="border-blue-500/40 text-blue-300 bg-blue-500/10"
            >
              <Clock className="w-3 h-3 mr-1" />
              Coming Soon
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl"
          >
            <Card className="bg-slate-800/60 backdrop-blur-sm border-slate-600">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl text-white mb-2">
                  Multiplayer Mode
                </CardTitle>
                <p className="text-slate-300 text-lg">
                  Real-time multiplayer is coming soon!
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-left text-slate-300 space-y-4">
                  <h3 className="text-xl font-semibold text-white mb-3">
                    🚀 What's Coming:
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <strong className="text-white">
                          Real-time gameplay
                        </strong>
                        <br />
                        Play against friends in real-time with instant move
                        synchronization
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <strong className="text-white">
                          Room-based matchmaking
                        </strong>
                        <br />
                        Create private rooms and share codes with friends
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <strong className="text-white">Spectator mode</strong>
                        <br />
                        Watch ongoing games and learn from other players
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <strong className="text-white">Chat system</strong>
                        <br />
                        Communicate with your opponent during games
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-600">
                  <p className="text-slate-400 text-sm mb-4">
                    In the meantime, enjoy playing against our AI opponents!
                  </p>
                  <Link href="/game/ai">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3">
                      <Wifi className="w-4 h-4 mr-2" />
                      Play Against AI
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
