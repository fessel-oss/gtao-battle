// Game context for sharing game state across components

import {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { useGameSocket } from "../hooks/useGameSocket";
import type { ClientMessage, ServerMessage } from "../core/messages";
import type { RoomState, Team } from "../core/types";

interface GameContextValue {
  // Connection state
  connected: boolean;
  error: string | null;

  // Room state
  roomState: RoomState | null;
  playerId: string;
  roomId: string;

  // Player info
  isJudge: boolean;
  myTeam: Team | null;
  isInMatchup: boolean;
  canBuzz: boolean;

  // Actions
  send: (message: ClientMessage) => void;
  selectTeam: (team: Team | "judge") => void;
  startGame: (targetScore: number) => void;
  setSong: (youtubeUrl: string) => void;
  setMatchup: (playerA: string, playerB: string) => void;
  playSong: () => void;
  pauseSong: () => void;
  buzz: () => void;
  judgeDecision: (correct: boolean) => void;
  skipRound: () => void;
  nextRound: () => void;
  newGame: () => void;

  // Events
  lastMessage: ServerMessage | null;
}

const GameContext = createContext<GameContextValue | null>(null);

interface GameProviderProps {
  roomId: string;
  playerId: string;
  children: ReactNode;
}

export function GameProvider({ roomId, playerId, children }: GameProviderProps) {
  const [lastEvent, setLastEvent] = useState<ServerMessage | null>(null);

  const handleMessage = useCallback((message: ServerMessage) => {
    setLastEvent(message);
  }, []);

  const { connected, roomState, error, send, lastMessage } = useGameSocket({
    roomId,
    playerId,
    onMessage: handleMessage,
  });

  // Derived state
  const isJudge = roomState?.judgeId === playerId;
  const myPlayer = roomState?.players.find((p) => p.id === playerId);
  const myTeam = myPlayer?.team ?? null;

  const isInMatchup =
    roomState?.currentMatchup?.playerA === playerId ||
    roomState?.currentMatchup?.playerB === playerId;

  const canBuzz =
    roomState?.gameState === "playing" &&
    isInMatchup &&
    !roomState.cooldowns.includes(playerId) &&
    !roomState.buzzedPlayer;

  // Action helpers
  const selectTeam = useCallback(
    (team: Team | "judge") => {
      send({ type: "select_team", team });
    },
    [send]
  );

  const startGame = useCallback(
    (targetScore: number) => {
      send({ type: "start_game", targetScore });
    },
    [send]
  );

  const setSong = useCallback(
    (youtubeUrl: string) => {
      send({ type: "set_song", youtubeUrl });
    },
    [send]
  );

  const setMatchup = useCallback(
    (playerA: string, playerB: string) => {
      send({ type: "set_matchup", playerA, playerB });
    },
    [send]
  );

  const playSong = useCallback(() => {
    send({ type: "play_song" });
  }, [send]);

  const pauseSong = useCallback(() => {
    send({ type: "pause_song" });
  }, [send]);

  const buzz = useCallback(() => {
    send({ type: "buzz" });
  }, [send]);

  const judgeDecision = useCallback(
    (correct: boolean) => {
      send({ type: "judge_decision", correct });
    },
    [send]
  );

  const skipRound = useCallback(() => {
    send({ type: "skip_round" });
  }, [send]);

  const nextRound = useCallback(() => {
    send({ type: "next_round" });
  }, [send]);

  const newGame = useCallback(() => {
    send({ type: "new_game" });
  }, [send]);

  return (
    <GameContext.Provider
      value={{
        connected,
        error,
        roomState,
        playerId,
        roomId,
        isJudge,
        myTeam,
        isInMatchup,
        canBuzz,
        send,
        selectTeam,
        startGame,
        setSong,
        setMatchup,
        playSong,
        pauseSong,
        buzz,
        judgeDecision,
        skipRound,
        nextRound,
        newGame,
        lastMessage,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

