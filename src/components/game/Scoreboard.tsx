// Scoreboard component - Shows team scores and current matchup

import { Card } from "../ui/card";
import { useGame } from "../../context/GameContext";

export function Scoreboard() {
  const { roomState } = useGame();

  if (!roomState) return null;

  const { scores, targetScore, currentMatchup, gameState } = roomState;

  const playerA = currentMatchup
    ? roomState.players.find((p) => p.id === currentMatchup.playerA)
    : null;
  const playerB = currentMatchup
    ? roomState.players.find((p) => p.id === currentMatchup.playerB)
    : null;

  const isGameOver = gameState === "game_over";
  const winner = scores.A >= targetScore ? "A" : scores.B >= targetScore ? "B" : null;

  return (
    <Card className="p-4">
      {/* Score display */}
      <div className="flex items-center justify-center gap-8">
        {/* Team A Score */}
        <div className="text-center">
          <div
            className={`text-5xl font-black ${
              winner === "A"
                ? "text-blue-400 animate-pulse"
                : "text-blue-400/80"
            }`}
          >
            {scores.A}
          </div>
          <div className="text-sm font-medium text-blue-400">Team A</div>
        </div>

        {/* Target */}
        <div className="text-center space-y-1">
          <div className="text-2xl text-muted-foreground">vs</div>
          <div className="text-xs text-muted-foreground">
            First to {targetScore}
          </div>
        </div>

        {/* Team B Score */}
        <div className="text-center">
          <div
            className={`text-5xl font-black ${
              winner === "B"
                ? "text-pink-400 animate-pulse"
                : "text-pink-400/80"
            }`}
          >
            {scores.B}
          </div>
          <div className="text-sm font-medium text-pink-400">Team B</div>
        </div>
      </div>

      {/* Current matchup */}
      {currentMatchup && !isGameOver && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="text-center text-sm text-muted-foreground mb-2">
            Current Matchup
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <span className="font-semibold text-blue-400">
                  {playerA?.name ?? "?"}
                </span>
              </div>
            </div>
            <span className="text-xl font-bold text-muted-foreground">vs</span>
            <div className="text-center">
              <div className="px-4 py-2 rounded-lg bg-pink-500/10 border border-pink-500/30">
                <span className="font-semibold text-pink-400">
                  {playerB?.name ?? "?"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game over message */}
      {isGameOver && winner && (
        <div className="mt-4 pt-4 border-t border-border/50 text-center">
          <div className="text-2xl font-bold">
            <span className={winner === "A" ? "text-blue-400" : "text-pink-400"}>
              Team {winner}
            </span>{" "}
            Wins
          </div>
        </div>
      )}

      {/* Game state indicator */}
      {!isGameOver && (
        <div className="mt-3 text-center">
          <GameStateIndicator state={gameState} />
        </div>
      )}
    </Card>
  );
}

function GameStateIndicator({ state }: { state: string }) {
  const indicators: Record<string, { label: string; color: string }> = {
    round_setup: { label: "Setting up round...", color: "text-violet-400" },
    playing: { label: "Opening playing - BUZZ", color: "text-green-400" },
    guessing: { label: "Waiting for guess...", color: "text-yellow-400" },
    cooldown: { label: "Cooldown active", color: "text-orange-400" },
    round_end: { label: "Round complete", color: "text-muted-foreground" },
  };

  const indicator = indicators[state] ?? {
    label: state,
    color: "text-muted-foreground",
  };

  return (
    <span className={`text-sm font-medium ${indicator.color}`}>
      {indicator.label}
    </span>
  );
}
