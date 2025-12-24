// Interface for managing WebSocket connections
// Can be implemented with in-memory tracking or Redis pub/sub for multi-instance

import type { ServerMessage } from "../core/messages";

/**
 * Abstract connection interface
 * Wraps the actual WebSocket implementation
 */
export interface Connection {
  send(data: string): void;
  close(): void;
}

/**
 * Metadata stored with each connection
 */
export interface ConnectionInfo {
  playerId: string;
  roomId: string;
  connection: Connection;
}

export interface ConnectionManager {
  /**
   * Register a new connection for a player in a room
   */
  register(roomId: string, playerId: string, connection: Connection): void;

  /**
   * Remove a player's connection
   */
  unregister(playerId: string): void;

  /**
   * Send a message to a specific player
   */
  send(playerId: string, message: ServerMessage): void;

  /**
   * Broadcast a message to all players in a room
   */
  broadcast(roomId: string, message: ServerMessage): void;

  /**
   * Broadcast a message to all players in a room except one
   */
  broadcastExcept(roomId: string, excludePlayerId: string, message: ServerMessage): void;

  /**
   * Get a player's connection info
   */
  getConnectionInfo(playerId: string): ConnectionInfo | null;

  /**
   * Get the room ID for a player
   */
  getRoomId(playerId: string): string | null;

  /**
   * Get all player IDs in a room
   */
  getPlayersInRoom(roomId: string): string[];
}


