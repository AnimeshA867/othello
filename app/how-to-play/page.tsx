import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Target, RotateCcw, Users, Trophy } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Play Othello (Reversi) - Rules, Strategies & Tips",
  description:
    "Learn how to play Othello (Reversi), the classic black and white strategy board game. Complete guide with rules, strategies, tips for beginners and advanced tactics to master this disc-flipping game.",
  keywords: [
    "how to play othello",
    "othello rules",
    "reversi rules",
    "othello strategy",
    "reversi strategy",
    "othello tips",
    "learn othello",
    "othello guide",
    "black and white board game rules",
    "disc flipping game rules",
    "othello for beginners",
    "reversi tutorial",
    "othello tactics",
  ],
  openGraph: {
    title: "How to Play Othello (Reversi) - Complete Guide",
    description:
      "Master the classic black and white strategy board game with our comprehensive guide. Learn rules, strategies, and winning tactics.",
  },
};

export default function HowToPlayPage() {
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 md:mb-6 tracking-tight">
            How to Play Othello (Reversi)
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Master the classic black and white strategy board game with these
            simple rules and advanced tactics. Learn the art of disc flipping!
          </p>
        </div>

        {/* Basic Rules */}
        <div className="space-y-6 md:space-y-8 mb-12 md:mb-16">
          <Card className="border border-border hover:shadow-lg transition-shadow bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 md:h-6 md:w-6 text-foreground" />
                <CardTitle className="text-xl md:text-2xl text-foreground">
                  Objective
                </CardTitle>
              </div>
              <CardDescription className="text-base md:text-lg text-muted-foreground">
                End the game with the most discs of your color on the board.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-8 gap-0.5 sm:gap-1 w-40 sm:w-48 mx-auto bg-primary p-1 sm:p-2 rounded">
                {Array.from({ length: 64 }).map((_, i) => {
                  const isBlack = [28, 35].includes(i);
                  const isWhite = [27, 36].includes(i);
                  return (
                    <div
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 border border-primary-foreground flex items-center justify-center"
                    >
                      {isBlack && (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-black" />
                      )}
                      {isWhite && (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white" />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-center mt-4 text-sm md:text-base text-muted-foreground">
                Starting position: 2 black, 2 white discs in the center
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border hover:shadow-lg transition-shadow bg-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 md:h-6 md:w-6 text-foreground" />
                <CardTitle className="text-xl md:text-2xl text-foreground">
                  Basic Rule
                </CardTitle>
              </div>
              <CardDescription className="text-base md:text-lg text-muted-foreground">
                Place a disc to trap opponent discs between yours - they flip to
                your color.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <h4 className="font-semibold mb-3 text-sm md:text-base text-foreground">
                    Example Move:
                  </h4>
                  <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 items-center">
                    {/* Before */}
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground mb-2">
                        Before
                      </p>
                      <div className="grid grid-cols-4 gap-0.5 sm:gap-1 w-16 sm:w-24 bg-black p-1 rounded mx-auto">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600" />
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 flex items-center justify-center">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-black" />
                        </div>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 flex items-center justify-center">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white" />
                        </div>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600" />
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="text-lg md:text-2xl">→</div>

                    {/* After */}
                    <div>
                      <p className="text-xs md:text-sm text-gray-600 mb-2">
                        After
                      </p>
                      <div className="grid grid-cols-4 gap-0.5 sm:gap-1 w-16 sm:w-24 bg-black p-1 rounded mx-auto">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 flex items-center justify-center">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-black" />
                        </div>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 flex items-center justify-center">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-black" />
                        </div>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 flex items-center justify-center">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-black" />
                        </div>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600" />
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 mt-3">
                    Black places a disc on the left, trapping the white disc.
                    The white disc flips to black.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-black" />
                <CardTitle className="text-xl md:text-2xl">Turns</CardTitle>
              </div>
              <CardDescription className="text-base md:text-lg">
                Players alternate moves. You must flip at least one opponent
                disc per turn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-black flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm text-gray-500 md:text-base">
                      Black goes first
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">
                      Must make a move that flips at least one white disc
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white border-2 border-gray-300 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm md:text-base text-gray-500">
                      White goes second
                    </p>
                    <p className="text-xs md:text-sm text-gray-600">
                      Must make a move that flips at least one black disc
                    </p>
                  </div>
                </div>
                <div className="p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs md:text-sm text-black">
                    <strong>Important:</strong> If you cannot make a valid move,
                    your turn is skipped. If neither player can move, the game
                    ends.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 md:h-6 md:w-6 text-black" />
                <CardTitle className="text-xl md:text-2xl">Endgame</CardTitle>
              </div>
              <CardDescription className="text-base md:text-lg">
                When no moves are left, the player with the most discs wins.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="grid grid-cols-8 gap-0.5 sm:gap-1 w-48 sm:w-64 mx-auto bg-black p-1 sm:p-2 rounded">
                  {Array.from({ length: 64 }).map((_, i) => {
                    const isBlack = Math.random() > 0.4;
                    return (
                      <div
                        key={i}
                        className="w-5 h-5 sm:w-6 sm:h-6 bg-green-600 border border-black flex items-center justify-center"
                      >
                        <div
                          className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${
                            isBlack ? "bg-black" : "bg-white"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
                  <div className="text-center">
                    <div className="flex items-center gap-2 justify-center mb-1">
                      <div className="w-4 h-4 rounded-full bg-black" />
                      <span className="font-bold text-sm md:text-base">
                        Black: 35
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-2 justify-center mb-1">
                      <div className="w-4 h-4 rounded-full bg-white border border-gray-300" />
                      <span className="font-bold text-sm md:text-base">
                        White: 29
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-base md:text-lg font-semibold text-green-600">
                  Black Wins!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips & Strategies */}
        <Card className="border-2 mb-8 md:mb-12">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl md:text-2xl">
                    Tips & Strategies
                  </CardTitle>
                  <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <CardDescription className="text-base md:text-lg">
                  Advanced tactics to improve your game
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-base md:text-lg">
                      Key Strategies:
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-black mt-2 flex-shrink-0" />
                        <div className="text-sm md:text-base">
                          <strong>Control the corners:</strong> Corner pieces
                          cannot be flipped and provide stable positions.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-black mt-2 flex-shrink-0" />
                        <div className="text-sm md:text-base">
                          <strong>Secure the edges:</strong> Edge pieces are
                          harder to flip than center pieces.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-black mt-2 flex-shrink-0" />
                        <div className="text-sm md:text-base">
                          <strong>Avoid X-squares:</strong> Squares diagonally
                          adjacent to corners can give your opponent corner
                          access.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-black mt-2 flex-shrink-0" />
                        <div className="text-sm md:text-base">
                          <strong>Mobility matters:</strong> Try to maximize
                          your options while limiting your opponent&apos;s.
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-base md:text-lg">
                      Advanced Tips:
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-white border border-gray-400 mt-2 flex-shrink-0" />
                        <div className="text-sm md:text-base">
                          <strong>Tempo:</strong> Sometimes it&apos;s better to
                          pass the initiative to your opponent.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-white border border-gray-400 mt-2 flex-shrink-0" />
                        <div className="text-sm md:text-base">
                          <strong>Parity:</strong> In the endgame, having the
                          last move can be crucial.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-white border border-gray-400 mt-2 flex-shrink-0" />
                        <div className="text-sm md:text-base">
                          <strong>Sacrifice pieces:</strong> Sometimes losing
                          pieces early can lead to better positions.
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-white border border-gray-400 mt-2 flex-shrink-0" />
                        <div className="text-sm md:text-base">
                          <strong>Think ahead:</strong> Consider not just your
                          next move, but your opponent&apos;s response.
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Call to Action */}
        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 md:px-8 py-2 md:py-3 text-base md:text-lg"
          >
            <Link href="/">Start Playing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
