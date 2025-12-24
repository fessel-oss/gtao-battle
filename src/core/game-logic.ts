// Pure game logic functions - no infrastructure dependencies

import type { Room, Team, Player, Matchup } from "./types";

const COOLDOWN_MS = 5000;

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Generate a random room code (4 uppercase letters)
 */
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // Removed confusing letters I, O
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Generate a unique player ID
 */
export function generatePlayerId(): string {
  return `p_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get players on a specific team
 */
export function getTeamPlayers(room: Room, team: Team): Player[] {
  return Array.from(room.players.values()).filter(
    (p) => p.team === team && p.role === "player"
  );
}

/**
 * Check if teams are balanced enough to start (at least 1 player per team)
 */
export function canStartGame(room: Room): { valid: boolean; error?: string } {
  const teamA = getTeamPlayers(room, "A");
  const teamB = getTeamPlayers(room, "B");

  if (teamA.length === 0) {
    return { valid: false, error: "Team A needs at least 1 player" };
  }
  if (teamB.length === 0) {
    return { valid: false, error: "Team B needs at least 1 player" };
  }
  if (!room.judgeId) {
    return { valid: false, error: "A judge is required to start the game" };
  }

  return { valid: true };
}

/**
 * Check if a player can buzz
 */
export function canPlayerBuzz(room: Room, playerId: string): boolean {
  // Must be in playing state
  if (room.gameState !== "playing") return false;

  // Must be in current matchup
  if (!room.currentMatchup) return false;
  if (
    room.currentMatchup.playerA !== playerId &&
    room.currentMatchup.playerB !== playerId
  ) {
    return false;
  }

  // Cannot be in cooldown
  if (room.cooldowns.has(playerId)) return false;

  return true;
}

/**
 * Get the opponent in the current matchup
 */
export function getOpponent(room: Room, playerId: string): string | null {
  if (!room.currentMatchup) return null;

  if (room.currentMatchup.playerA === playerId) {
    return room.currentMatchup.playerB;
  }
  if (room.currentMatchup.playerB === playerId) {
    return room.currentMatchup.playerA;
  }
  return null;
}

/**
 * Check if a player is the judge
 */
export function isJudge(room: Room, playerId: string): boolean {
  return room.judgeId === playerId;
}

/**
 * Check if a player is in the current matchup
 */
export function isInMatchup(room: Room, playerId: string): boolean {
  if (!room.currentMatchup) return false;
  return (
    room.currentMatchup.playerA === playerId ||
    room.currentMatchup.playerB === playerId
  );
}

/**
 * Get the team of a player
 */
export function getPlayerTeam(room: Room, playerId: string): Team | null {
  const player = room.players.get(playerId);
  return player?.team ?? null;
}

/**
 * Calculate the winner of the game
 */
export function getWinner(room: Room): Team | null {
  if (room.scores.A >= room.targetScore) return "A";
  if (room.scores.B >= room.targetScore) return "B";
  return null;
}

/**
 * Check if both matchup players are in cooldown (round should end with no winner)
 */
export function areBothPlayersInCooldown(room: Room): boolean {
  if (!room.currentMatchup) return false;
  return (
    room.cooldowns.has(room.currentMatchup.playerA) &&
    room.cooldowns.has(room.currentMatchup.playerB)
  );
}

/**
 * Get cooldown duration in milliseconds
 */
export function getCooldownDuration(): number {
  return COOLDOWN_MS;
}

/**
 * Validate a matchup (both players exist and are on correct teams)
 */
export function validateMatchup(
  room: Room,
  playerA: string,
  playerB: string
): { valid: boolean; error?: string } {
  const pA = room.players.get(playerA);
  const pB = room.players.get(playerB);

  if (!pA) {
    return { valid: false, error: `Player ${playerA} not found` };
  }
  if (!pB) {
    return { valid: false, error: `Player ${playerB} not found` };
  }
  if (pA.team !== "A") {
    return { valid: false, error: `${pA.name} is not on Team A` };
  }
  if (pB.team !== "B") {
    return { valid: false, error: `${pB.name} is not on Team B` };
  }

  return { valid: true };
}


