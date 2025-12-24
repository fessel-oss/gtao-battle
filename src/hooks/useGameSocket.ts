// WebSocket hook for game communication

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientMessage, ServerMessage } from "../core/messages";
import type { RoomState } from "../core/types";

export interface UseGameSocketOptions {
  roomId: string;
  playerId: string;
  onMessage?: (message: ServerMessage) => void;
}

export interface UseGameSocketReturn {
  connected: boolean;
  roomState: RoomState | null;
  error: string | null;
  send: (message: ClientMessage) => void;
  lastMessage: ServerMessage | null;
}

export function useGameSocket({
  roomId,
  playerId,
  onMessage,
}: UseGameSocketOptions): UseGameSocketReturn {
  const [connected, setConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<ServerMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws?roomId=${roomId}&playerId=${playerId}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[WS] Connected");
      setConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const message: ServerMessage = JSON.parse(event.data);
        setLastMessage(message);

        // Handle specific message types
        switch (message.type) {
          case "room_state":
            setRoomState(message.state);
            break;
          case "error":
            setError(message.message);
            break;
          case "player_joined":
            setRoomState((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                players: [...prev.players, message.player],
              };
            });
            break;
          case "player_left":
            setRoomState((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                players: prev.players.map((p) =>
                  p.id === message.playerId ? { ...p, connected: false } : p
                ),
              };
            });
            break;
          case "point_scored":
            setRoomState((prev) => {
              if (!prev) return prev;
              return { ...prev, scores: message.scores };
            });
            break;
          case "game_over":
            setRoomState((prev) => {
              if (!prev) return prev;
              return { ...prev, gameState: "game_over" };
            });
            break;
        }

        onMessage?.(message);
      } catch (err) {
        console.error("[WS] Failed to parse message:", err);
      }
    };

    ws.onclose = () => {
      console.log("[WS] Disconnected");
      setConnected(false);

      // Attempt to reconnect after 2 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("[WS] Attempting reconnect...");
        connect();
      }, 2000);
    };

    ws.onerror = (event) => {
      console.error("[WS] Error:", event);
      setError("WebSocket connection error");
    };
  }, [roomId, playerId, onMessage]);

  useEffect(() => {
    connect();

    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("[WS] Cannot send, not connected");
    }
  }, []);

  return {
    connected,
    roomState,
    error,
    send,
    lastMessage,
  };
}


