// Domain types for the Song Guessing Duel game

export type GameState =
  | "lobby"
  | "round_setup"
  | "playing"
  | "guessing"
  | "cooldown"
  | "round_end"
  | "game_over";

export type Team = "A" | "B";

export type PlayerRole = "player" | "judge";

export interface Player {
  id: string;
  name: string;
  team: Team | null;
  role: PlayerRole;
  connected: boolean;
}

export interface Matchup {
  playerA: string; // player ID from Team A
  playerB: string; // player ID from Team B
}

export interface Room {
  id: string;
  players: Map<string, Player>;
  judgeId: string | null;
  gameState: GameState;
  targetScore: number;
  scores: { A: number; B: number };
  currentMatchup: Matchup | null;
  currentYoutubeId: string | null;
  buzzedPlayer: string | null;
  buzzTime: number | null;
  cooldowns: Set<string>; // player IDs currently in cooldown
  createdAt: number;
  // Song playback tracking
  songStartedAt: number | null; // timestamp when song started playing
  songPausedAt: number | null; // timestamp when song was paused
  songPosition: number; // position in seconds when last paused/started
}

// Serializable version of Room for sending over WebSocket
export interface RoomState {
  id: string;
  players: { id: string; name: string; team: Team | null; role: PlayerRole; connected: boolean }[];
  judgeId: string | null;
  gameState: GameState;
  targetScore: number;
  scores: { A: number; B: number };
  currentMatchup: Matchup | null;
  currentYoutubeId: string | null;
  buzzedPlayer: string | null;
  cooldowns: string[];
  // Playback state - so clients can sync even if they miss play/pause messages
  isPlaying: boolean;
  songPosition: number; // position in seconds to seek to
}

// Helper to convert Room to serializable RoomState
export function roomToState(room: Room): RoomState {
  // Calculate if song is currently playing
  const isPlaying = room.songStartedAt !== null && room.songPausedAt === null;
  
  // Calculate current song position
  let songPosition = room.songPosition;
  if (isPlaying && room.songStartedAt) {
    // If playing, calculate elapsed time from when it started
    const elapsed = (Date.now() - room.songStartedAt) / 1000;
    songPosition = room.songPosition + elapsed;
  }

  return {
    id: room.id,
    players: Array.from(room.players.values()).map((p) => ({
      id: p.id,
      name: p.name,
      team: p.team,
      role: p.role,
      connected: p.connected,
    })),
    judgeId: room.judgeId,
    gameState: room.gameState,
    targetScore: room.targetScore,
    scores: room.scores,
    currentMatchup: room.currentMatchup,
    currentYoutubeId: room.currentYoutubeId,
    buzzedPlayer: room.buzzedPlayer,
    cooldowns: Array.from(room.cooldowns),
    isPlaying,
    songPosition,
  };
}

// Helper to create a new room
export function createRoom(id: string): Room {
  return {
    id,
    players: new Map(),
    judgeId: null,
    gameState: "lobby",
    targetScore: 5,
    scores: { A: 0, B: 0 },
    currentMatchup: null,
    currentYoutubeId: null,
    buzzedPlayer: null,
    buzzTime: null,
    cooldowns: new Set(),
    createdAt: Date.now(),
    songStartedAt: null,
    songPausedAt: null,
    songPosition: 0,
  };
}

// Helper to create a new player
export function createPlayer(id: string, name: string): Player {
  return {
    id,
    name,
    team: null,
    role: "player",
    connected: true,
  };
}

