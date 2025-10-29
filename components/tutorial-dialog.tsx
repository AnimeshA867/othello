"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Circle,
  Disc,
  Target,
  Zap,
  Trophy,
} from "lucide-react";

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
  tip?: string;
}

interface TutorialDialogProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to Othello!",
    description:
      "Othello (also known as Reversi) is a classic strategy board game for two players. The goal is to have the most pieces of your color on the board when the game ends. Let's learn the basics!",
    icon: <Trophy className="w-12 h-12 text-yellow-500" />,
    tip: "The game is easy to learn but challenging to master!",
  },
  {
    title: "The Board Setup",
    description:
      "The game is played on an 8×8 board with 64 squares. The game starts with 4 pieces in the center: 2 black and 2 white pieces arranged in a diagonal pattern. Black always moves first.",
    icon: <Target className="w-12 h-12 text-blue-500" />,
    tip: "The starting position is always the same in every game.",
  },
  {
    title: "How to Place Pieces",
    description:
      "You can only place a piece where it will 'sandwich' or flank one or more of your opponent's pieces between your new piece and an existing piece of your color. The sandwiched pieces must form a straight line (horizontal, vertical, or diagonal).",
    icon: <Disc className="w-12 h-12 text-green-500" />,
    tip: "Valid moves will be highlighted on the board!",
  },
  {
    title: "Flipping Pieces",
    description:
      "When you place a piece that sandwiches your opponent's pieces, all the sandwiched pieces flip to your color. You can flip multiple lines of pieces in a single move! The more pieces you flip, the better.",
    icon: <Zap className="w-12 h-12 text-purple-500" />,
    tip: "Corner and edge positions are very valuable because they can't be flipped back!",
  },
  {
    title: "Taking Turns",
    description:
      "Players alternate turns. If you don't have any valid moves, your turn is skipped and your opponent plays again. The game ends when neither player can make a valid move, usually when the board is full.",
    icon: <Circle className="w-12 h-12 text-orange-500" />,
    tip: "Sometimes it's strategic to force your opponent to play in bad positions!",
  },
  {
    title: "Winning the Game",
    description:
      "When the game ends, the player with the most pieces of their color on the board wins. The score is shown throughout the game. Plan ahead and try to control key positions like corners!",
    icon: <Trophy className="w-12 h-12 text-yellow-500" />,
    tip: "Remember: It's not about early lead, it's about the final count!",
  },
];

export function TutorialDialog({
  open,
  onComplete,
  onSkip,
}: TutorialDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [state, setState] = useState(open);
  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  return (
    <Dialog
      open={state}
      onOpenChange={() => {
        setState(false);
      }}
    >
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-gray-900 via-gray-800 to-black border-gray-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              {step.icon}
              {step.title}
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="bg-blue-500/20 text-blue-300">
              Step {currentStep + 1} of {tutorialSteps.length}
            </Badge>
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          <DialogDescription className="text-gray-300 text-base leading-relaxed mb-4">
            {step.description}
          </DialogDescription>

          {step.tip && (
            <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-yellow-400 text-sm">
                    Pro Tip:
                  </p>
                  <p className="text-gray-300 text-sm mt-1">{step.tip}</p>
                </div>
              </div>
            </div>
          )}

          {/* Visual guide based on step */}
          {currentStep === 1 && (
            <div className="mt-4 flex justify-center">
              <div className="inline-grid grid-cols-8 gap-0.5 bg-gray-700 p-2 rounded-lg">
                {Array.from({ length: 64 }).map((_, idx) => {
                  const row = Math.floor(idx / 8);
                  const col = idx % 8;
                  const isCenter =
                    (row === 3 && col === 3) ||
                    (row === 4 && col === 4) ||
                    (row === 3 && col === 4) ||
                    (row === 4 && col === 3);
                  const isWhite =
                    (row === 3 && col === 3) || (row === 4 && col === 4);
                  const isBlack =
                    (row === 3 && col === 4) || (row === 4 && col === 3);

                  return (
                    <div
                      key={idx}
                      className="w-6 h-6 bg-green-700 flex items-center justify-center"
                    >
                      {isWhite && (
                        <div className="w-5 h-5 rounded-full bg-white" />
                      )}
                      {isBlack && (
                        <div className="w-5 h-5 rounded-full bg-black border border-gray-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="mt-4 flex justify-center">
              <div className="inline-grid grid-cols-8 gap-0.5 bg-gray-700 p-2 rounded-lg">
                {Array.from({ length: 64 }).map((_, idx) => {
                  const row = Math.floor(idx / 8);
                  const col = idx % 8;
                  const isWhite =
                    (row === 3 && col === 3) || (row === 4 && col === 4);
                  const isBlack =
                    (row === 3 && col === 4) || (row === 4 && col === 3);
                  const isValidMove =
                    (row === 2 && col === 3) ||
                    (row === 3 && col === 2) ||
                    (row === 4 && col === 5) ||
                    (row === 5 && col === 4);

                  return (
                    <div
                      key={idx}
                      className={`w-6 h-6 flex items-center justify-center ${
                        isValidMove
                          ? "bg-green-500 animate-pulse"
                          : "bg-green-700"
                      }`}
                    >
                      {isWhite && (
                        <div className="w-5 h-5 rounded-full bg-white" />
                      )}
                      {isBlack && (
                        <div className="w-5 h-5 rounded-full bg-black border border-gray-600" />
                      )}
                      {isValidMove && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="border-gray-600 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            Skip Tutorial
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {currentStep === tutorialSteps.length - 1 ? (
                "Start Playing!"
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
