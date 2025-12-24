// In-memory implementation of ConnectionManager
// Tracks WebSocket connections for single-instance deployment

import type { ServerMessage } from "../../core/messages";
import { serializeServerMessage } from "../../core/messages";
import type {
  Connection,
  ConnectionInfo,
  ConnectionManager,
} from "../../ports/connection-manager";

export class MemoryConnectionManager implements ConnectionManager {
  // playerId -> ConnectionInfo
  private connections: Map<string, ConnectionInfo> = new Map();
  // roomId -> Set of playerIds
  private roomPlayers: Map<string, Set<string>> = new Map();

  register(roomId: string, playerId: string, connection: Connection): void {
    // Store connection info
    this.connections.set(playerId, {
      playerId,
      roomId,
      connection,
    });

    // Add to room's player set
    if (!this.roomPlayers.has(roomId)) {
      this.roomPlayers.set(roomId, new Set());
    }
    this.roomPlayers.get(roomId)!.add(playerId);
  }

  unregister(playerId: string): void {
    const info = this.connections.get(playerId);
    if (!info) return;

    // Remove from room's player set
    const roomPlayers = this.roomPlayers.get(info.roomId);
    if (roomPlayers) {
      roomPlayers.delete(playerId);
      if (roomPlayers.size === 0) {
        this.roomPlayers.delete(info.roomId);
      }
    }

    // Remove connection
    this.connections.delete(playerId);
  }

  send(playerId: string, message: ServerMessage): void {
    const info = this.connections.get(playerId);
    if (!info) return;

    try {
      info.connection.send(serializeServerMessage(message));
    } catch (error) {
      console.error(`Failed to send to player ${playerId}:`, error);
    }
  }

  broadcast(roomId: string, message: ServerMessage): void {
    const playerIds = this.roomPlayers.get(roomId);
    if (!playerIds) return;

    const serialized = serializeServerMessage(message);
    for (const playerId of playerIds) {
      const info = this.connections.get(playerId);
      if (info) {
        try {
          info.connection.send(serialized);
        } catch (error) {
          console.error(`Failed to broadcast to player ${playerId}:`, error);
        }
      }
    }
  }

  broadcastExcept(
    roomId: string,
    excludePlayerId: string,
    message: ServerMessage
  ): void {
    const playerIds = this.roomPlayers.get(roomId);
    if (!playerIds) return;

    const serialized = serializeServerMessage(message);
    for (const playerId of playerIds) {
      if (playerId === excludePlayerId) continue;

      const info = this.connections.get(playerId);
      if (info) {
        try {
          info.connection.send(serialized);
        } catch (error) {
          console.error(`Failed to broadcast to player ${playerId}:`, error);
        }
      }
    }
  }

  getConnectionInfo(playerId: string): ConnectionInfo | null {
    return this.connections.get(playerId) ?? null;
  }

  getRoomId(playerId: string): string | null {
    return this.connections.get(playerId)?.roomId ?? null;
  }

  getPlayersInRoom(roomId: string): string[] {
    const playerIds = this.roomPlayers.get(roomId);
    return playerIds ? Array.from(playerIds) : [];
  }
}


