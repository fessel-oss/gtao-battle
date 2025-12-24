// Game state machine - handles all game actions and state transitions
// Uses interfaces (ports) for infrastructure, no direct dependencies

import type { Room, Player, GameState, Team, Matchup } from "./types";
import { createRoom, createPlayer, roomToState } from "./types";
import type { ClientMessage, ServerMessage } from "./messages";
import type { RoomStore } from "../ports/room-store";
import type { ConnectionManager } from "../ports/connection-manager";
import type { TimerService } from "../ports/timer-service";
import {
  extractYoutubeId,
  generateRoomCode,
  generatePlayerId,
  canStartGame,
  canPlayerBuzz,
  getPlayerTeam,
  getWinner,
  getCooldownDuration,
  validateMatchup,
  isJudge,
  areBothPlayersInCooldown,
} from "./game-logic";

export interface GameMachineDeps {
  roomStore: RoomStore;
  connections: ConnectionManager;
  timers: TimerService;
}

export interface GameMachine {
  handleMessage(playerId: string, message: ClientMessage): Promise<void>;
  handleConnect(playerId: string, roomId: string): Promise<void>;
  handleDisconnect(playerId: string): Promise<void>;
  createRoomForPlayer(playerName: string): Promise<{ roomId: string; playerId: string }>;
  joinRoom(roomId: string, playerName: string): Promise<{ playerId: string } | null>;
}

export function createGameMachine(deps: GameMachineDeps): GameMachine {
  const { roomStore, connections, timers } = deps;

  // Helper to broadcast room state to all players
  async function broadcastRoomState(roomId: string): Promise<void> {
    const room = await roomStore.get(roomId);
    if (!room) return;

    connections.broadcast(roomId, {
      type: "room_state",
      state: roomToState(room),
    });
  }

  // Helper to get timer ID for room cooldowns
  function cooldownTimerId(roomId: string, playerId: string): string {
    return `room:${roomId}:cooldown:${playerId}`;
  }

  // Handle room creation
  async function handleCreateRoom(
    playerName: string
  ): Promise<{ roomId: string; playerId: string }> {
    // Generate unique room code
    let roomId: string;
    let attempts = 0;
    do {
      roomId = generateRoomCode();
      attempts++;
      if (attempts > 100) {
        throw new Error("Failed to generate unique room code");
      }
    } while (await roomStore.exists(roomId));

    const playerId = generatePlayerId();
    const room = createRoom(roomId);
    const player = createPlayer(playerId, playerName);
    room.players.set(playerId, player);

    await roomStore.create(room);

    return { roomId, playerId };
  }

  // Handle player joining a room
  async function handleJoinRoom(
    roomId: string,
    playerName: string
  ): Promise<{ playerId: string } | null> {
    const room = await roomStore.get(roomId);
    if (!room) return null;

    const playerId = generatePlayerId();
    const player = createPlayer(playerId, playerName);

    await roomStore.update(roomId, (r) => {
      r.players.set(playerId, player);
      return r;
    });

    // Notify others
    connections.broadcastExcept(roomId, playerId, {
      type: "player_joined",
      player: { ...player },
    });

    return { playerId };
  }

  // Handle team selection
  async function handleSelectTeam(
    roomId: string,
    playerId: string,
    team: "A" | "B" | "judge"
  ): Promise<void> {
    const room = await roomStore.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    // Can only change team in lobby
    if (room.gameState !== "lobby") {
      connections.send(playerId, {
        type: "error",
        message: "Cannot change team during game",
      });
      return;
    }

    await roomStore.update(roomId, (r) => {
      const p = r.players.get(playerId);
      if (!p) return r;

      if (team === "judge") {
        // If someone else is judge, demote them
        if (r.judgeId && r.judgeId !== playerId) {
          const oldJudge = r.players.get(r.judgeId);
          if (oldJudge) {
            oldJudge.role = "player";
            oldJudge.team = null;
          }
        }
        p.role = "judge";
        p.team = null;
        r.judgeId = playerId;
      } else {
        // Becoming a player
        if (r.judgeId === playerId) {
          r.judgeId = null;
        }
        p.role = "player";
        p.team = team;
      }

      return r;
    });

    await broadcastRoomState(roomId);
  }

  // Handle game start
  async function handleStartGame(
    roomId: string,
    playerId: string,
    targetScore: number
  ): Promise<void> {
    const room = await roomStore.get(roomId);
    if (!room) return;

    // Only judge can start
    if (!isJudge(room, playerId)) {
      connections.send(playerId, {
        type: "error",
        message: "Only the judge can start the game",
      });
      return;
    }

    const check = canStartGame(room);
    if (!check.valid) {
      connections.send(playerId, {
        type: "error",
        message: check.error!,
      });
      return;
    }

    await roomStore.update(roomId, (r) => {
      r.gameState = "round_setup";
      r.targetScore = Math.max(1, Math.min(20, targetScore));
      r.scores = { A: 0, B: 0 };
      return r;
    });

    connections.broadcast(roomId, {
      type: "game_started",
      targetScore: Math.max(1, Math.min(20, targetScore)),
    });

    await broadcastRoomState(roomId);
  }

  // Handle setting the song
  async function handleSetSong(
    roomId: string,
    playerId: string,
    youtubeUrl: string
  ): Promise<void> {
    const room = await roomStore.get(roomId);
    if (!room) return;

    if (!isJudge(room, playerId)) {
      connections.send(playerId, {
        type: "error",
        message: "Only the judge can set the song",
      });
      return;
    }

    if (room.gameState !== "round_setup") {
      connections.send(playerId, {
        type: "error",
        message: "Can only set song during round setup",
      });
      return;
    }

    const youtubeId = extractYoutubeId(youtubeUrl);
    if (!youtubeId) {
      connections.send(playerId, {
        type: "error",
        message: "Invalid YouTube URL",
      });
      return;
    }

    await roomStore.update(roomId, (r) => {
      r.currentYoutubeId = youtubeId;
      return r;
    });

    connections.broadcast(roomId, {
      type: "song_ready",
      youtubeId,
    });
  }

  // Handle setting the matchup
  async function handleSetMatchup(
    roomId: string,
    playerId: string,
    playerA: string,
    playerB: string
  ): Promise<void> {
    const room = await roomStore.get(roomId);
    if (!room) return;

    if (!isJudge(room, playerId)) {
      connections.send(playerId, {
        type: "error",
        message: "Only the judge can set the matchup",
      });
      return;
    }

    if (room.gameState !== "round_setup") {
      connections.send(playerId, {
        type: "error",
        message: "Can only set matchup during round setup",
      });
      return;
    }

    const check = validateMatchup(room, playerA, playerB);
    if (!check.valid) {
      connections.send(playerId, {
        type: "error",
        message: check.error!,
      });
      return;
    }

    const matchup: Matchup = { playerA, playerB };

    await roomStore.update(roomId, (r) => {
      r.currentMatchup = matchup;
      return r;
    });

    connections.broadcast(roomId, {
      type: "round_setup",
      matchup,
    });

    await broadcastRoomState(roomId);
  }

  // Helper to calculate current song position
  function calculateSongPosition(room: Room): number {
    if (room.songStartedAt && !room.songPausedAt) {
      // Song is playing - calculate elapsed time
      const elapsed = (Date.now() - room.songStartedAt) / 1000;
      return room.songPosition + elapsed;
    }
    // Song is paused or never started
    return room.songPosition;
  }

  // Handle play song
  async function handlePlaySong(roomId: string, playerId: string): Promise<void> {
    const room = await roomStore.get(roomId);
    if (!room) return;

    if (!isJudge(room, playerId)) {
      connections.send(playerId, {
        type: "error",
        message: "Only the judge can control playback",
      });
      return;
    }

    if (!room.currentYoutubeId) {
      connections.send(playerId, {
        type: "error",
        message: "No song selected",
      });
      return;
    }

    if (!room.currentMatchup) {
      connections.send(playerId, {
        type: "error",
        message: "No matchup selected",
      });
      return;
    }

    // Determine position to start from
    // If this is a fresh start (from round_setup), start from 0
    // Otherwise resume from current position
    const isFirstPlay = room.gameState === "round_setup";
    const seekTo = isFirstPlay ? 0 : room.songPosition;

    const startTime = Date.now() + 500;

    await roomStore.update(roomId, (r) => {
      r.gameState = "playing";
      r.buzzedPlayer = null;
      r.buzzTime = null;
      r.cooldowns.clear();
      r.songStartedAt = startTime;
      r.songPausedAt = null;
      r.songPosition = seekTo;
      return r;
    });

    // Broadcast play with position for sync
    connections.broadcast(roomId, {
      type: "play",
      startTime,
      seekTo,
    });

    await broadcastRoomState(roomId);
  }

  // Handle pause song
  async function handlePauseSong(roomId: string, playerId: string): Promise<void> {
    const room = await roomStore.get(roomId);
    if (!room) return;

    if (!isJudge(room, playerId)) {
      connections.send(playerId, {
        type: "error",
        message: "Only the judge can control playback",
      });
      return;
    }

    // Calculate and save current position
    const currentPosition = calculateSongPosition(room);

    await roomStore.update(roomId, (r) => {
      r.songPausedAt = Date.now();
      r.songPosition = currentPosition;
      return r;
    });

    connections.broadcast(roomId, { type: "pause", position: currentPosition });
  }

  // Handle buzz
  async function handleBuzz(roomId: string, playerId: string): Promise<void> {
    const room = await roomStore.get(roomId);
    if (!room) return;

    if (!canPlayerBuzz(room, playerId)) {
      return; // Silently ignore invalid buzzes
    }

    const player = room.players.get(playerId);
    if (!player) return;

    // Calculate position before buzz
    const currentPosition = calculateSongPosition(room);

    // Atomic update - first valid buzz wins
    await roomStore.update(roomId, (r) => {
      // Double-check state hasn't changed
      if (r.gameState !== "playing") return r;
      if (r.buzzedPlayer) return r; // Someone else buzzed first

      r.gameState = "guessing";
      r.buzzedPlayer = playerId;
      r.buzzTime = Date.now();
      r.songPausedAt = Date.now();
      r.songPosition = currentPosition;
      return r;
    });

    // Verify the buzz was accepted
    const updated = await roomStore.get(roomId);
    if (updated?.buzzedPlayer === playerId) {
      // Pause the song so player can say their answer
      connections.broadcast(roomId, { type: "pause", position: currentPosition });

      connections.broadcast(roomId, {
        type: "player_buzzed",
        playerId,
        playerName: player.name,
      });
      await broadcastRoomState(roomId);
    }
  }

  // Handle judge decision
  async function handleJudgeDecision(
    roomId: string,
    playerId: string,
    correct: boolean
  ): Promise<void> {
    const room = await roomStore.get(roomId);
    if (!room) return;

    if (!isJudge(room, playerId)) {
      connections.send(playerId, {
        type: "error",
        message: "Only the judge can make decisions",
      });
      return;
    }

    if (room.gameState !== "guessing" || !room.buzzedPlayer) {
      connections.send(playerId, {
        type: "error",
        message: "No player is currently guessing",
      });
      return;
    }

    const buzzedPlayerId = room.buzzedPlayer;
    const team = getPlayerTeam(room, buzzedPlayerId);

    if (correct && team) {
      // Correct guess - award point
      await roomStore.update(roomId, (r) => {
        r.scores[team]++;
        r.gameState = "round_end";
        r.buzzedPlayer = null;
        return r;
      });

      const updatedRoom = await roomStore.get(roomId);
      if (!updatedRoom) return;

      connections.broadcast(roomId, {
        type: "guess_result",
        correct: true,
        playerId: buzzedPlayerId,
      });

      connections.broadcast(roomId, {
        type: "point_scored",
        team,
        scores: updatedRoom.scores,
      });

      // Check for game over
      const winner = getWinner(updatedRoom);
      if (winner) {
        await roomStore.update(roomId, (r) => {
          r.gameState = "game_over";
          return r;
        });

        connections.broadcast(roomId, {
          type: "game_over",
          winner,
        });
      } else {
        connections.broadcast(roomId, {
          type: "round_end",
          winningTeam: team,
          scores: updatedRoom.scores,
        });
      }
    } else {
      // Wrong guess - apply cooldown
      const cooldownEnd = Date.now() + getCooldownDuration();

      // Get the position to resume from
      const resumePosition = room.songPosition;
      const startTime = Date.now() + 300;

      await roomStore.update(roomId, (r) => {
        r.cooldowns.add(buzzedPlayerId);
        r.buzzedPlayer = null;
        r.gameState = "playing"; // Back to playing, opponent can still buzz
        r.songStartedAt = startTime;
        r.songPausedAt = null;
        // Keep songPosition as is - we resume from where we paused
        return r;
      });

      connections.broadcast(roomId, {
        type: "guess_result",
        correct: false,
        playerId: buzzedPlayerId,
      });

      // Resume playing the song from where we paused
      connections.broadcast(roomId, {
        type: "play",
        startTime,
        seekTo: resumePosition,
      });

      connections.broadcast(roomId, {
        type: "cooldown_start",
        playerId: buzzedPlayerId,
        endsAt: cooldownEnd,
      });

      // Schedule cooldown end
      timers.schedule(
        cooldownTimerId(roomId, buzzedPlayerId),
        getCooldownDuration(),
        async () => {
          const currentRoom = await roomStore.get(roomId);
          if (!currentRoom) return;

          await roomStore.update(roomId, (r) => {
            r.cooldowns.delete(buzzedPlayerId);
            return r;
          });

          connections.broadcast(roomId, {
            type: "cooldown_end",
            playerId: buzzedPlayerId,
          });

          // Check if both players now in cooldown (shouldn't happen after removing one)
          // but handle the case where both timed out
          const updatedRoom = await roomStore.get(roomId);
          if (updatedRoom && areBothPlayersInCooldown(updatedRoom)) {
            // Round ends with no winner
            await roomStore.update(roomId, (r) => {
              r.gameState = "round_end";
              return r;
            });

            connections.broadcast(roomId, {
              type: "round_end",
              winningTeam: null,
              scores: updatedRoom.scores,
            });
          }

          await broadcastRoomState(roomId);
        }
      );

      // Check if both players are now in cooldown
      const updatedRoom = await roomStore.get(roomId);
      if (updatedRoom && areBothPlayersInCooldown(updatedRoom)) {
        await roomStore.update(roomId, (r) => {
          r.gameState = "round_end";
          return r;
        });

        connections.broadcast(roomId, {
          type: "round_end",
          winningTeam: null,
          scores: updatedRoom.scores,
        });
      }
    }

    await broadcastRoomState(roomId);
  }

  // Handle skip round (judge decides no one can get it)
  async function handleSkipRound(roomId: string, playerId: string): Promise<void> {
    const room = await roomStore.get(roomId);
    if (!room) return;

    if (!isJudge(room, playerId)) {
      connections.send(playerId, {
        type: "error",
        message: "Only the judge can skip a round",
      });
      return;
    }

    // Can skip during playing, guessing, or cooldown states
    if (!["playing", "guessing", "cooldown"].includes(room.gameState)) {
      connections.send(playerId, {
        type: "error",
        message: "Cannot skip round in current state",
      });
      return;
    }

    // Cancel any cooldown timers
    timers.cancelAll(`room:${roomId}:cooldown:`);

    // Calculate current song position before stopping
    const currentPosition = calculateSongPosition(room);

    await roomStore.update(roomId, (r) => {
      r.gameState = "round_end";
      r.buzzedPlayer = null;
      r.cooldowns.clear();
      r.songPausedAt = Date.now();
      r.songPosition = currentPosition;
      return r;
    });

    // Pause the song
    connections.broadcast(roomId, { type: "pause", position: currentPosition });

    // Announce round skipped (no winner)
    connections.broadcast(roomId, {
      type: "round_end",
      winningTeam: null,
      scores: room.scores,
    });

    await broadcastRoomState(roomId);
  }

  // Handle next round
  async function handleNextRound(roomId: string, playerId: string): Promise<void> {
    const room = await roomStore.get(roomId);
    if (!room) return;

    if (!isJudge(room, playerId)) {
      connections.send(playerId, {
        type: "error",
        message: "Only the judge can proceed to next round",
      });
      return;
    }

    if (room.gameState !== "round_end") {
      return;
    }

    // Cancel any remaining cooldown timers
    timers.cancelAll(`room:${roomId}:cooldown:`);

    await roomStore.update(roomId, (r) => {
      r.gameState = "round_setup";
      r.currentYoutubeId = null;
      r.currentMatchup = null;
      r.buzzedPlayer = null;
      r.cooldowns.clear();
      return r;
    });

    await broadcastRoomState(roomId);
  }

  // Handle new game
  async function handleNewGame(roomId: string, playerId: string): Promise<void> {
    const room = await roomStore.get(roomId);
    if (!room) return;

    if (!isJudge(room, playerId)) {
      connections.send(playerId, {
        type: "error",
        message: "Only the judge can start a new game",
      });
      return;
    }

    // Cancel all timers for this room
    timers.cancelAll(`room:${roomId}:`);

    await roomStore.update(roomId, (r) => {
      r.gameState = "lobby";
      r.scores = { A: 0, B: 0 };
      r.currentMatchup = null;
      r.currentYoutubeId = null;
      r.buzzedPlayer = null;
      r.cooldowns.clear();
      return r;
    });

    await broadcastRoomState(roomId);
  }

  // Handle player disconnect
  async function handleDisconnect(playerId: string): Promise<void> {
    const roomId = connections.getRoomId(playerId);
    if (!roomId) return;

    const room = await roomStore.get(roomId);
    if (!room) return;

    await roomStore.update(roomId, (r) => {
      const player = r.players.get(playerId);
      if (player) {
        player.connected = false;
      }
      return r;
    });

    connections.broadcast(roomId, {
      type: "player_left",
      playerId,
    });

    await broadcastRoomState(roomId);
  }

  // Handle player reconnect
  async function handleConnect(playerId: string, roomId: string): Promise<void> {
    const room = await roomStore.get(roomId);
    if (!room) return;

    await roomStore.update(roomId, (r) => {
      const player = r.players.get(playerId);
      if (player) {
        player.connected = true;
      }
      return r;
    });

    await broadcastRoomState(roomId);
  }

  // Main message handler
  async function handleMessage(
    playerId: string,
    message: ClientMessage
  ): Promise<void> {
    const roomId = connections.getRoomId(playerId);

    switch (message.type) {
      case "create_room": {
        // This is handled separately via createRoomForPlayer
        break;
      }

      case "join_room": {
        // This is handled separately via joinRoom
        break;
      }

      case "select_team": {
        if (!roomId) return;
        await handleSelectTeam(roomId, playerId, message.team);
        break;
      }

      case "start_game": {
        if (!roomId) return;
        await handleStartGame(roomId, playerId, message.targetScore);
        break;
      }

      case "set_song": {
        if (!roomId) return;
        await handleSetSong(roomId, playerId, message.youtubeUrl);
        break;
      }

      case "set_matchup": {
        if (!roomId) return;
        await handleSetMatchup(roomId, playerId, message.playerA, message.playerB);
        break;
      }

      case "play_song": {
        if (!roomId) return;
        await handlePlaySong(roomId, playerId);
        break;
      }

      case "pause_song": {
        if (!roomId) return;
        await handlePauseSong(roomId, playerId);
        break;
      }

      case "buzz": {
        if (!roomId) return;
        await handleBuzz(roomId, playerId);
        break;
      }

      case "judge_decision": {
        if (!roomId) return;
        await handleJudgeDecision(roomId, playerId, message.correct);
        break;
      }

      case "skip_round": {
        if (!roomId) return;
        await handleSkipRound(roomId, playerId);
        break;
      }

      case "next_round": {
        if (!roomId) return;
        await handleNextRound(roomId, playerId);
        break;
      }

      case "new_game": {
        if (!roomId) return;
        await handleNewGame(roomId, playerId);
        break;
      }
    }
  }

  return {
    handleMessage,
    handleConnect,
    handleDisconnect,
    createRoomForPlayer: handleCreateRoom,
    joinRoom: handleJoinRoom,
  };
}

