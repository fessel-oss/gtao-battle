import { useState, useEffect } from "react";
import { Home } from "./pages/Home";
import { Room } from "./pages/Room";
import "./index.css";

interface GameSession {
  roomId: string;
  playerId: string;
}

export function App() {
  const [session, setSession] = useState<GameSession | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const roomId = localStorage.getItem("roomId");
    const playerId = localStorage.getItem("playerId");

    if (roomId && playerId) {
      // Verify the room still exists
      fetch(`/api/room/${roomId}`)
        .then((res) => {
          if (res.ok) {
            setSession({ roomId, playerId });
          } else {
            // Clear invalid session
            localStorage.removeItem("roomId");
            localStorage.removeItem("playerId");
          }
        })
        .catch(() => {
          localStorage.removeItem("roomId");
          localStorage.removeItem("playerId");
        });
    }
  }, []);

  const handleJoinRoom = (roomId: string, playerId: string) => {
    setSession({ roomId, playerId });
  };

  const handleLeave = () => {
    localStorage.removeItem("roomId");
    localStorage.removeItem("playerId");
    setSession(null);
  };

  if (session) {
    return (
      <Room
        roomId={session.roomId}
        playerId={session.playerId}
        onLeave={handleLeave}
      />
    );
  }

  return <Home onJoinRoom={handleJoinRoom} />;
}

export default App;
