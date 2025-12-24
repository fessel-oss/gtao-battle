// WebSocket handler for Bun
// Translates WebSocket events to game machine actions

import type { ServerWebSocket } from "bun";
import type { GameMachine } from "../core/game-machine";
import type { ConnectionManager, Connection } from "../ports/connection-manager";
import { parseClientMessage } from "../core/messages";

export interface WebSocketData {
  playerId: string;
  roomId: string;
}

// Adapter to wrap Bun's ServerWebSocket as our Connection interface
class BunWebSocketConnection implements Connection {
  constructor(private ws: ServerWebSocket<WebSocketData>) {}

  send(data: string): void {
    this.ws.send(data);
  }

  close(): void {
    this.ws.close();
  }
}

export interface WebSocketHandlerDeps {
  game: GameMachine;
  connections: ConnectionManager;
}

export function createWebSocketHandler(deps: WebSocketHandlerDeps) {
  const { game, connections } = deps;

  return {
    async open(ws: ServerWebSocket<WebSocketData>) {
      const { playerId, roomId } = ws.data;
      console.log(`[WS] Player ${playerId} connected to room ${roomId}`);

      // Register the connection
      connections.register(roomId, playerId, new BunWebSocketConnection(ws));

      // Notify game of connect
      await game.handleConnect(playerId, roomId);
    },

    async message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer) {
      const { playerId } = ws.data;
      const messageStr = typeof message === "string" ? message : message.toString();

      const parsed = parseClientMessage(messageStr);
      if (!parsed) {
        console.error(`[WS] Invalid message from ${playerId}:`, messageStr);
        return;
      }

      console.log(`[WS] Message from ${playerId}:`, parsed.type);
      await game.handleMessage(playerId, parsed);
    },

    async close(ws: ServerWebSocket<WebSocketData>) {
      const { playerId } = ws.data;
      console.log(`[WS] Player ${playerId} disconnected`);

      // Notify game of disconnect
      await game.handleDisconnect(playerId);

      // Unregister the connection
      connections.unregister(playerId);
    },
  };
}


