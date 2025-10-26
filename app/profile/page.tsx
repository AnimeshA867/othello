"use client";

import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Zap,
  Target,
  TrendingUp,
  User as UserIcon,
  Edit2,
  Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAppSelector } from "@/lib/redux/hooks";

interface UserProfile {
  username: string;
  displayName: string;
  bio: string;
  country: string;
  stats: {
    totalGames: number;
    wins: number;
    losses: number;
    draws: number;
    eloRating: number;
    rank: string;
    winRate: number;
    currentWinStreak: number;
    longestWinStreak: number;
  };
}

export default function ProfilePage() {
  const user = useUser();
  const router = useRouter();
  const { toast } = useToast();

  // Read user data from Redux
  const reduxUser = useAppSelector((state: any) => state.user);
  const gameStats = useAppSelector((state: any) => state.user.gameStats);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    country: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin");
      return;
    }

    // Fetch user profile from API
    fetchProfile();
  }, [user, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          displayName: data.displayName || "",
          bio: data.bio || "",
          country: data.country || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
        setIsEditing(false);
        fetchProfile();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const winRate =
    profile.stats.totalGames > 0
      ? Math.round((profile.stats.wins / profile.stats.totalGames) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl">
                    {profile.displayName || user.displayName}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    @{profile.username}
                  </CardDescription>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-sm">
                      {profile.stats.rank}
                    </Badge>
                    <Badge variant="outline" className="ml-2">
                      ELO: {profile.stats.eloRating}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "outline" : "default"}
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Games</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-muted-foreground" />
                <p className="text-3xl font-bold">{profile.stats.totalGames}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Win Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <p className="text-3xl font-bold">{winRate}%</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {profile.stats.wins}W - {profile.stats.losses}L -{" "}
                {profile.stats.draws}D
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Current Streak</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                <p className="text-3xl font-bold">
                  {profile.stats.currentWinStreak}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Best Streak</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <p className="text-3xl font-bold">
                  {profile.stats.longestWinStreak}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Detailed Stats</TabsTrigger>
            <TabsTrigger value="history">Match History</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={formData.displayName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            displayName: e.target.value,
                          })
                        }
                        placeholder="Your display name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input
                        id="bio"
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        placeholder="Tell us about yourself"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        placeholder="Your country"
                      />
                    </div>
                    <Button onClick={handleSave} className="w-full">
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Bio</p>
                      <p className="mt-1">{profile.bio || "No bio yet"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Country</p>
                      <p className="mt-1">
                        {profile.country || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Member Since
                      </p>
                      <p className="mt-1">{new Date().getFullYear()}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <Card>
              <CardHeader>
                <CardTitle>Game Statistics</CardTitle>
                <CardDescription>
                  Your performance across different game modes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Total Games</span>
                    <span>{profile.stats.totalGames}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Wins</span>
                    <span className="text-green-600 font-bold">
                      {profile.stats.wins}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Losses</span>
                    <span className="text-red-600 font-bold">
                      {profile.stats.losses}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">Draws</span>
                    <span className="text-yellow-600 font-bold">
                      {profile.stats.draws}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="font-medium">ELO Rating</span>
                    <span className="font-bold">{profile.stats.eloRating}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium">Win Rate</span>
                    <span className="font-bold">{winRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Match History</CardTitle>
                <CardDescription>Your recent games</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  No match history yet. Start playing to see your games here!
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>
                  Unlock achievements as you play
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">
                  Achievement system coming soon!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
