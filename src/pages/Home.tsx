// Home page - Create or join a room

import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card } from "../components/ui/card";

interface HomeProps {
  onJoinRoom: (roomId: string, playerId: string) => void;
}

export function Home({ onJoinRoom }: HomeProps) {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: playerName.trim() }),
      });

      if (!res.ok) {
        throw new Error("Failed to create room");
      }

      const { roomId, playerId } = await res.json();

      // Save to localStorage for reconnection
      localStorage.setItem("playerId", playerId);
      localStorage.setItem("roomId", roomId);
      localStorage.setItem("playerName", playerName.trim());

      onJoinRoom(roomId, playerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!roomCode.trim()) {
      setError("Please enter a room code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const code = roomCode.trim().toUpperCase();
      const res = await fetch(`/api/room/${code}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: playerName.trim() }),
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Room not found");
        }
        throw new Error("Failed to join room");
      }

      const { roomId, playerId } = await res.json();

      // Save to localStorage for reconnection
      localStorage.setItem("playerId", playerId);
      localStorage.setItem("roomId", roomId);
      localStorage.setItem("playerName", playerName.trim());

      onJoinRoom(roomId, playerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and title */}
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              GTAO
            </span>
            <span className="text-foreground/90"> Battle</span>
          </h1>
          <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
            Guess The Anime Opening
          </p>
          <p className="text-muted-foreground pt-2">
            Identify the opening faster than your opponent
          </p>
        </div>

        {/* Name input */}
        <Card className="p-6 space-y-4 border-border/50 bg-card/80 backdrop-blur">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold">
              Your Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name..."
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="text-lg h-12 bg-background/50"
              maxLength={20}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Create room */}
          <Button
            onClick={handleCreateRoom}
            disabled={loading}
            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
          >
            {loading ? "Creating..." : "Create New Room"}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or join existing</span>
            </div>
          </div>

          {/* Join room */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="text-lg h-12 uppercase tracking-widest font-mono bg-background/50"
              maxLength={4}
            />
            <Button
              onClick={handleJoinRoom}
              disabled={loading}
              variant="outline"
              className="h-12 px-6 text-lg font-bold"
            >
              Join
            </Button>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-4 bg-muted/20 border-dashed border-border/50">
          <h3 className="font-semibold mb-2">How to play</h3>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Create a room and share the code with friends</li>
            <li>Split into two teams and pick a judge</li>
            <li>The judge plays anime openings, teams race to guess</li>
            <li>First team to reach the target score wins</li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
