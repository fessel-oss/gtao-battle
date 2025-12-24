// WebSocket message types for client-server communication

import type { Player, RoomState, Team, Matchup } from "./types";

// ============================================
// Client -> Server Messages
// ============================================

export type ClientMessage =
  | { type: "create_room"; playerName: string }
  | { type: "join_room"; roomId: string; playerName: string }
  | { type: "select_team"; team: Team | "judge" }
  | { type: "start_game"; targetScore: number }
  | { type: "set_song"; youtubeUrl: string }
  | { type: "set_matchup"; playerA: string; playerB: string }
  | { type: "play_song" }
  | { type: "pause_song" }
  | { type: "buzz" }
  | { type: "judge_decision"; correct: boolean }
  | { type: "skip_round" }
  | { type: "next_round" }
  | { type: "new_game" };

// ============================================
// Server -> Client Messages
// ============================================

export type ServerMessage =
  | { type: "error"; message: string }
  | { type: "room_created"; roomId: string; playerId: string }
  | { type: "room_joined"; roomId: string; playerId: string }
  | { type: "room_state"; state: RoomState }
  | { type: "player_joined"; player: Player }
  | { type: "player_left"; playerId: string }
  | { type: "player_updated"; player: Player }
  | { type: "game_started"; targetScore: number }
  | { type: "round_setup"; matchup: Matchup }
  | { type: "song_ready"; youtubeId: string }
  | { type: "play"; startTime: number; seekTo: number } // seekTo is position in seconds
  | { type: "pause"; position: number } // position when paused, for tracking
  | { type: "player_buzzed"; playerId: string; playerName: string }
  | { type: "guess_result"; correct: boolean; playerId: string }
  | { type: "cooldown_start"; playerId: string; endsAt: number }
  | { type: "cooldown_end"; playerId: string }
  | { type: "point_scored"; team: Team; scores: { A: number; B: number } }
  | { type: "round_end"; winningTeam: Team | null; scores: { A: number; B: number } }
  | { type: "game_over"; winner: Team };

// ============================================
// Utilities
// ============================================

export function parseClientMessage(data: string): ClientMessage | null {
  try {
    return JSON.parse(data) as ClientMessage;
  } catch {
    return null;
  }
}

export function serializeServerMessage(message: ServerMessage): string {
  return JSON.stringify(message);
}

