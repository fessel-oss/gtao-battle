// Room page - Main game room container

import { GameProvider, useGame } from "../context/GameContext";
import { Lobby } from "../components/game/Lobby";
import { JudgePanel } from "../components/game/JudgePanel";
import { PlayerView } from "../components/game/PlayerView";
import { Scoreboard } from "../components/game/Scoreboard";

interface RoomProps {
  roomId: string;
  playerId: string;
  onLeave: () => void;
}

function RoomContent({ onLeave }: { onLeave: () => void }) {
  const { connected, error, roomState, isJudge, roomId } = useGame();

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Connecting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl text-destructive">X</div>
          <p className="text-destructive">{error}</p>
          <button
            onClick={onLeave}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  if (!roomState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading room...</p>
        </div>
      </div>
    );
  }

  // Room code header
  const header = (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur border-b border-border/50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-bold">
              <span className="text-violet-400">GTAO</span> Battle
            </h1>
            <p className="text-xs text-muted-foreground">
              Room:{" "}
              <span className="font-mono font-bold tracking-wider">{roomId}</span>
            </p>
          </div>
        </div>
        <button
          onClick={onLeave}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Leave
        </button>
      </div>
    </div>
  );

  // Lobby state - team selection
  if (roomState.gameState === "lobby") {
    return (
      <>
        {header}
        <div className="pt-20 pb-8">
          <Lobby />
        </div>
      </>
    );
  }

  // Game states - show different views based on role
  return (
    <>
      {header}
      <div className="pt-20 pb-8 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          {/* Scoreboard is always visible during game */}
          <Scoreboard />

          {/* Show judge panel or player view */}
          {isJudge ? <JudgePanel /> : <PlayerView />}
        </div>
      </div>
    </>
  );
}

export function Room({ roomId, playerId, onLeave }: RoomProps) {
  return (
    <GameProvider roomId={roomId} playerId={playerId}>
      <RoomContent onLeave={onLeave} />
    </GameProvider>
  );
}
