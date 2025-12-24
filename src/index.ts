import { serve } from "bun";
import index from "./index.html";
import { createGameMachine } from "./core/game-machine";
import { MemoryRoomStore } from "./adapters/memory/room-store";
import { MemoryConnectionManager } from "./adapters/memory/connection-manager";
import { MemoryTimerService } from "./adapters/memory/timer-service";
import { createWebSocketHandler, type WebSocketData } from "./server/websocket-handler";
import { serializeServerMessage } from "./core/messages";
import { roomToState } from "./core/types";

// Create adapters (swap these for Redis when scaling)
const roomStore = new MemoryRoomStore();
const connections = new MemoryConnectionManager();
const timers = new MemoryTimerService();

// Create game machine with injected dependencies
const game = createGameMachine({ roomStore, connections, timers });

// Create WebSocket handler
const wsHandler = createWebSocketHandler({ game, connections });

const server = serve({
  port: 3000,

  routes: {
    // Serve index.html for root and all frontend routes
    "/": index,
    "/*": index,

    // API: Create a new room
    "/api/room": {
      async POST(req) {
        try {
          const body = await req.json();
          const playerName = body.playerName || "Player";

          const { roomId, playerId } = await game.createRoomForPlayer(playerName);

          return Response.json({ roomId, playerId });
        } catch (error) {
          console.error("Failed to create room:", error);
          return Response.json({ error: "Failed to create room" }, { status: 500 });
        }
      },
    },

    // API: Join or check room
    "/api/room/:roomId": {
      async GET(req) {
        const roomId = req.params.roomId;
        const exists = await roomStore.exists(roomId);

        if (!exists) {
          return Response.json({ error: "Room not found" }, { status: 404 });
        }

        const room = await roomStore.get(roomId);
        if (!room) {
          return Response.json({ error: "Room not found" }, { status: 404 });
        }

        return Response.json({
          roomId: room.id,
          playerCount: room.players.size,
          gameState: room.gameState,
        });
      },

      async POST(req) {
        try {
          const roomId = req.params.roomId;
          const body = await req.json();
          const playerName = body.playerName || "Player";

          const result = await game.joinRoom(roomId, playerName);
          if (!result) {
            return Response.json({ error: "Room not found" }, { status: 404 });
          }

          return Response.json({ roomId, playerId: result.playerId });
        } catch (error) {
          console.error("Failed to join room:", error);
          return Response.json({ error: "Failed to join room" }, { status: 500 });
        }
      },
    },
  },

  // Handle WebSocket upgrade
  async fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade
    if (url.pathname === "/ws") {
      const roomId = url.searchParams.get("roomId");
      const playerId = url.searchParams.get("playerId");

      if (!roomId || !playerId) {
        return new Response("Missing roomId or playerId", { status: 400 });
      }

      // Verify room exists and player is in it
      const room = await roomStore.get(roomId);
      if (!room) {
        return new Response("Room not found", { status: 404 });
      }

      if (!room.players.has(playerId)) {
        return new Response("Player not in room", { status: 403 });
      }

      const upgraded = server.upgrade<WebSocketData>(req, {
        data: { playerId, roomId },
      });

      if (!upgraded) {
        return new Response("WebSocket upgrade failed", { status: 500 });
      }

      return undefined;
    }

    // Let routes handle everything else
    return undefined;
  },

  websocket: wsHandler,

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`GTAO Battle server running at ${server.url}`);
