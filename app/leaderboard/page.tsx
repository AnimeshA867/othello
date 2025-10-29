"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

interface LeaderboardPlayer {
  rank: number;
  username: string;
  displayName: string;
  eloRating: number;
  wins: number;
  losses: number;
  totalGames: number;
  winRate: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setError(null);
      const response = await fetch("/api/leaderboard");
      if (response.ok) {
        const data = await response.json();
        console.log("Leaderboard data:", data); // Debug log
        setLeaderboard(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to load leaderboard");
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600" />;
      default:
        return <span className="text-muted-foreground font-bold">#{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Global Leaderboard</h1>
          <p className="text-muted-foreground">
            Top players ranked by ELO rating
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rankings</CardTitle>
            <CardDescription>
              Compete in ranked matches to climb the leaderboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading leaderboard...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 mb-4">⚠️</div>
                <p className="text-muted-foreground text-lg mb-4">{error}</p>
                <button
                  onClick={fetchLeaderboard}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Try Again
                </button>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  No players yet. Be the first to join!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((player) => (
                  <div
                    key={player.username}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all hover:bg-accent/50 ${
                      player.rank <= 3 ? "bg-accent/30" : "bg-card"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 text-center">
                        {getRankIcon(player.rank)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-lg">
                          {player.displayName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          @{player.username}
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">ELO</div>
                        <div className="font-bold text-lg">
                          {player.eloRating}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">
                          Win Rate
                        </div>
                        <div className="font-bold text-lg">
                          {player.winRate}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">
                          Record
                        </div>
                        <div className="font-bold text-sm">
                          {player.wins}W - {player.losses}L
                        </div>
                      </div>
                    </div>

                    <div className="md:hidden">
                      <Badge variant="secondary">{player.eloRating} ELO</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
