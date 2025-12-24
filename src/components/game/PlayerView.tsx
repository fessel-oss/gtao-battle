// Player view - Main game view for players (not judges)

import { useEffect, useState, useCallback } from "react";
import { Card } from "../ui/card";
import { useGame } from "../../context/GameContext";
import { YouTubePlayer } from "./YouTubePlayer";

export function PlayerView() {
  const {
    roomState,
    playerId,
    isInMatchup,
    canBuzz,
    buzz,
    lastMessage,
  } = useGame();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playStartTime, setPlayStartTime] = useState<number | undefined>(undefined);
  const [seekToPosition, setSeekToPosition] = useState<number | undefined>(undefined);
  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [buzzFlash, setBuzzFlash] = useState(false);

  // Stable callback for YouTube player
  const handleYouTubeReady = useCallback(() => {
    console.log("[PlayerView] YouTube player ready");
  }, []);

  if (!roomState) return null;

  const { gameState, currentMatchup, currentYoutubeId, buzzedPlayer, cooldowns } =
    roomState;

  const buzzedPlayerInfo = buzzedPlayer
    ? roomState.players.find((p) => p.id === buzzedPlayer)
    : null;

  const isMyBuzz = buzzedPlayer === playerId;
  const isInCooldown = cooldowns.includes(playerId);

  // Listen for play/pause/cooldown messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case "play":
        console.log(`[PlayerView] Received play message - startTime: ${lastMessage.startTime}, seekTo: ${lastMessage.seekTo}`);
        setPlayStartTime(lastMessage.startTime);
        setSeekToPosition(lastMessage.seekTo);
        setIsPlaying(true);
        break;
      case "pause":
        console.log("[PlayerView] Received pause message");
        setIsPlaying(false);
        break;
      case "room_state":
        // Sync playback state from room_state in case we missed play/pause messages
        if (lastMessage.state.isPlaying !== isPlaying) {
          console.log(`[PlayerView] Syncing from room_state - isPlaying: ${lastMessage.state.isPlaying}, position: ${lastMessage.state.songPosition}`);
          setIsPlaying(lastMessage.state.isPlaying);
          if (lastMessage.state.isPlaying) {
            // If should be playing, seek to the current position
            setSeekToPosition(lastMessage.state.songPosition);
            // Use current time as start (immediate play)
            setPlayStartTime(Date.now());
          }
        }
        break;
      case "cooldown_start":
        if (lastMessage.playerId === playerId) {
          setCooldownEnd(lastMessage.endsAt);
        }
        break;
      case "cooldown_end":
        if (lastMessage.playerId === playerId) {
          setCooldownEnd(null);
          setCooldownRemaining(0);
        }
        break;
      case "player_buzzed":
        if (lastMessage.playerId === playerId) {
          setBuzzFlash(true);
          setTimeout(() => setBuzzFlash(false), 300);
        }
        break;
    }
  }, [lastMessage, playerId, isPlaying]);

  // Cooldown countdown timer
  useEffect(() => {
    if (!cooldownEnd) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, cooldownEnd - Date.now());
      setCooldownRemaining(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        setCooldownEnd(null);
        setCooldownRemaining(0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [cooldownEnd]);

  // Reset state when going back to round setup
  useEffect(() => {
    if (gameState === "round_setup") {
      setIsPlaying(false);
      setPlayStartTime(undefined);
      setSeekToPosition(undefined);
      setCooldownEnd(null);
      setCooldownRemaining(0);
    }
  }, [gameState]);

  // Spacebar handler
  const handleBuzz = useCallback(() => {
    if (canBuzz) {
      buzz();
    }
  }, [canBuzz, buzz]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && canBuzz) {
        e.preventDefault();
        handleBuzz();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canBuzz, handleBuzz]);

  // Game over view
  if (gameState === "game_over") {
    const winner =
      roomState.scores.A >= roomState.targetScore ? "A" : "B";
    const myTeam = roomState.players.find((p) => p.id === playerId)?.team;
    const didWin = myTeam === winner;

    return (
      <Card className="p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold">
          {didWin ? "Your Team Won!" : "Game Over"}
        </h2>
        <p className="text-muted-foreground">
          {didWin
            ? "Congratulations!"
            : `Team ${winner} wins this time. Better luck next game!`}
        </p>
        <p className="text-sm text-muted-foreground">
          Waiting for judge to start a new game...
        </p>
      </Card>
    );
  }

  // Waiting for round setup
  if (gameState === "round_setup") {
    return (
      <Card className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Waiting for Round</h2>
        <p className="text-muted-foreground">
          The judge is selecting an opening and matchup...
        </p>
      </Card>
    );
  }

  // Round end
  if (gameState === "round_end") {
    return (
      <Card className="p-8 text-center space-y-4">
        <h2 className="text-xl font-bold">Round Complete</h2>
        <p className="text-muted-foreground">
          Waiting for judge to start next round...
        </p>
      </Card>
    );
  }

  // Playing / Guessing state
  return (
    <div className="space-y-6">
      {/* Hidden YouTube player (audio only - no video visible to players) */}
      {currentYoutubeId && (
        <div className="sr-only">
          <YouTubePlayer
            videoId={currentYoutubeId}
            isPlaying={isPlaying}
            onReady={handleYouTubeReady}
            startTime={playStartTime}
            seekTo={seekToPosition}
            audioOnly={true}
          />
        </div>
      )}

      {/* Audio playing indicator for players in matchup */}
      {currentYoutubeId && isInMatchup && isPlaying && (
        <Card className="p-6 text-center bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/30">
          <div className="flex items-center justify-center gap-3">
            <div className="flex gap-1">
              <span className="w-1 h-6 bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-8 bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-5 bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              <span className="w-1 h-7 bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
              <span className="w-1 h-4 bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
            </div>
            <span className="text-lg font-semibold text-violet-400">Opening Playing...</span>
            <div className="flex gap-1">
              <span className="w-1 h-4 bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
              <span className="w-1 h-7 bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
              <span className="w-1 h-5 bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              <span className="w-1 h-8 bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-6 bg-violet-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
            </div>
          </div>
        </Card>
      )}

      {/* Not in matchup message */}
      {!isInMatchup && (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            Listen to the matchup - you're not playing this round
          </p>
          {isPlaying && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="flex gap-1">
                <span className="w-1 h-4 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-6 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-3 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                <span className="w-1 h-5 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
              </div>
              <span className="text-sm text-muted-foreground">Audio playing</span>
            </div>
          )}
        </Card>
      )}

      {/* Buzzer section - only for players in matchup */}
      {isInMatchup && (
        <div className="flex flex-col items-center justify-center py-8">
          {/* Status message */}
          <div className="mb-6 text-center">
            {gameState === "guessing" && isMyBuzz && (
              <div className="text-xl font-bold text-yellow-400 animate-pulse">
                SAY YOUR ANSWER
              </div>
            )}
            {gameState === "guessing" && !isMyBuzz && buzzedPlayerInfo && (
              <div className="text-lg text-muted-foreground">
                {buzzedPlayerInfo.name} buzzed - waiting for their answer...
              </div>
            )}
            {isInCooldown && cooldownRemaining > 0 && (
              <div className="text-lg text-red-400">
                Cooldown: {cooldownRemaining}s
              </div>
            )}
            {gameState === "playing" && canBuzz && (
              <div className="text-lg text-green-400 animate-pulse">
                Press SPACE or click to buzz
              </div>
            )}
          </div>

          {/* Big Buzzer Button */}
          <BuzzerButton
            onClick={handleBuzz}
            disabled={!canBuzz}
            state={getBuzzerState({
              canBuzz,
              isInCooldown,
              cooldownRemaining,
              gameState,
              isMyBuzz,
              buzzedPlayer,
            })}
            flash={buzzFlash}
          />

          {/* Keyboard hint */}
          {canBuzz && (
            <div className="mt-6 text-sm text-muted-foreground">
              or press <kbd className="px-2 py-1 bg-muted rounded font-mono">SPACE</kbd>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type BuzzerState = "ready" | "disabled" | "cooldown" | "waiting" | "buzzed";

function getBuzzerState({
  canBuzz,
  isInCooldown,
  cooldownRemaining,
  gameState,
  isMyBuzz,
  buzzedPlayer,
}: {
  canBuzz: boolean;
  isInCooldown: boolean;
  cooldownRemaining: number;
  gameState: string;
  isMyBuzz: boolean;
  buzzedPlayer: string | null;
}): BuzzerState {
  if (isMyBuzz) return "buzzed";
  if (isInCooldown && cooldownRemaining > 0) return "cooldown";
  if (buzzedPlayer) return "waiting";
  if (canBuzz) return "ready";
  return "disabled";
}

interface BuzzerButtonProps {
  onClick: () => void;
  disabled: boolean;
  state: BuzzerState;
  flash: boolean;
}

function BuzzerButton({ onClick, disabled, state, flash }: BuzzerButtonProps) {
  const baseClasses =
    "w-48 h-48 rounded-full flex items-center justify-center text-white font-bold text-2xl transition-all duration-150 select-none";

  const stateClasses: Record<BuzzerState, string> = {
    ready:
      "bg-gradient-to-br from-violet-400 to-fuchsia-600 shadow-[0_0_60px_rgba(139,92,246,0.5)] hover:scale-105 hover:shadow-[0_0_80px_rgba(139,92,246,0.7)] active:scale-95 cursor-pointer animate-pulse",
    disabled:
      "bg-gradient-to-br from-gray-500 to-gray-700 opacity-50 cursor-not-allowed",
    cooldown:
      "bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_40px_rgba(239,68,68,0.4)] cursor-not-allowed",
    waiting:
      "bg-gradient-to-br from-yellow-500 to-amber-600 shadow-[0_0_40px_rgba(234,179,8,0.4)] cursor-not-allowed",
    buzzed:
      "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-[0_0_60px_rgba(234,179,8,0.6)] animate-pulse cursor-not-allowed",
  };

  const labels: Record<BuzzerState, string> = {
    ready: "BUZZ",
    disabled: "WAIT",
    cooldown: "...",
    waiting: "...",
    buzzed: "GO",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${stateClasses[state]} ${
        flash ? "scale-110 brightness-150" : ""
      }`}
    >
      {labels[state]}
    </button>
  );
}
