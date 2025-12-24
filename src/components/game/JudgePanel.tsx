// Judge control panel - Control the game flow

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { useGame } from "../../context/GameContext";
import { YouTubePlayer } from "./YouTubePlayer";
import { animeOpenings, searchOpenings, getYouTubeUrl, type AnimeOpening } from "../../db";

// Extract YouTube video ID from various URL formats
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

export function JudgePanel() {
  const {
    roomState,
    setSong,
    setMatchup,
    playSong,
    pauseSong,
    judgeDecision,
    skipRound,
    nextRound,
    newGame,
    lastMessage,
  } = useGame();

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayerA, setSelectedPlayerA] = useState<string | null>(null);
  const [selectedPlayerB, setSelectedPlayerB] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playStartTime, setPlayStartTime] = useState<number | undefined>(undefined);
  const [seekToPosition, setSeekToPosition] = useState<number | undefined>(undefined);

  // Extract video ID from current URL
  const currentVideoId = useMemo(() => extractYouTubeId(youtubeUrl), [youtubeUrl]);

  // Filter openings based on search
  const filteredOpenings = useMemo(() => {
    if (!searchQuery.trim()) {
      return animeOpenings;
    }
    return searchOpenings(searchQuery);
  }, [searchQuery]);

  // Stable callback for YouTube player
  const handleYouTubeReady = useCallback(() => {
    console.log("[JudgePanel] YouTube player ready");
  }, []);

  // Auto-set song when URL changes and is valid
  useEffect(() => {
    if (currentVideoId && youtubeUrl.trim()) {
      setSong(youtubeUrl.trim());
    }
  }, [currentVideoId, youtubeUrl, setSong]);

  // Auto-set matchup when both players are selected
  useEffect(() => {
    if (selectedPlayerA && selectedPlayerB) {
      setMatchup(selectedPlayerA, selectedPlayerB);
    }
  }, [selectedPlayerA, selectedPlayerB, setMatchup]);

  if (!roomState) return null;

  const { gameState, currentMatchup, currentYoutubeId, buzzedPlayer } = roomState;

  const teamA = roomState.players.filter((p) => p.team === "A" && p.connected);
  const teamB = roomState.players.filter((p) => p.team === "B" && p.connected);

  const buzzedPlayerInfo = buzzedPlayer
    ? roomState.players.find((p) => p.id === buzzedPlayer)
    : null;

  // Get player names for display
  const playerAName = selectedPlayerA 
    ? teamA.find(p => p.id === selectedPlayerA)?.name 
    : null;
  const playerBName = selectedPlayerB 
    ? teamB.find(p => p.id === selectedPlayerB)?.name 
    : null;

  // Listen for play/pause messages from server
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === "play") {
      console.log(`[JudgePanel] Received play message - startTime: ${lastMessage.startTime}, seekTo: ${lastMessage.seekTo}`);
      setPlayStartTime(lastMessage.startTime);
      setSeekToPosition(lastMessage.seekTo);
      setIsPlaying(true);
    } else if (lastMessage.type === "pause") {
      console.log("[JudgePanel] Received pause message");
      setIsPlaying(false);
    } else if (lastMessage.type === "room_state") {
      if (lastMessage.state.gameState === "round_setup" || lastMessage.state.gameState === "round_end") {
        setIsPlaying(false);
        setPlayStartTime(undefined);
        setSeekToPosition(undefined);
      } else if (lastMessage.state.isPlaying !== isPlaying) {
        console.log(`[JudgePanel] Syncing from room_state - isPlaying: ${lastMessage.state.isPlaying}, position: ${lastMessage.state.songPosition}`);
        setIsPlaying(lastMessage.state.isPlaying);
        if (lastMessage.state.isPlaying) {
          setSeekToPosition(lastMessage.state.songPosition);
          setPlayStartTime(Date.now());
        }
      }
    }
  }, [lastMessage, isPlaying]);

  // Reset state when going back to round setup
  useEffect(() => {
    if (gameState === "round_setup" || gameState === "round_end" || gameState === "game_over") {
      setIsPlaying(false);
      setPlayStartTime(undefined);
      setSeekToPosition(undefined);
    }
  }, [gameState]);

  const handleSelectOpening = (opening: AnimeOpening) => {
    const url = getYouTubeUrl(opening.youtubeId);
    setYoutubeUrl(url);
  };

  const handlePlay = () => {
    console.log("[JudgePanel] Play clicked");
    playSong();
  };

  const handlePause = () => {
    console.log("[JudgePanel] Pause clicked");
    pauseSong();
    setIsPlaying(false);
  };

  // Game over view
  if (gameState === "game_over") {
    return (
      <Card className="p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold">Game Over</h2>
        <p className="text-muted-foreground">
          Team {roomState.scores.A >= roomState.targetScore ? "A" : "B"} wins!
        </p>
        <Button
          onClick={newGame}
          size="lg"
          className="bg-gradient-to-r from-violet-500 to-fuchsia-500"
        >
          Start New Game
        </Button>
      </Card>
    );
  }

  // Round setup view - redesigned
  if (gameState === "round_setup") {
    return (
      <div className="space-y-6">
        {/* Opening Selection */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Select Opening
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Left side: URL input + Preview */}
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Paste YouTube URL..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="bg-background/50 font-mono text-sm"
              />
              
              {/* Preview */}
              <div className="aspect-video bg-black/50 rounded-lg overflow-hidden border border-border/50">
                {currentVideoId ? (
                  <YouTubePlayer
                    videoId={currentVideoId}
                    isPlaying={false}
                    onReady={handleYouTubeReady}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    Paste a URL or select from suggestions
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Suggestions list */}
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Search openings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background/50"
              />
              
              <div className="h-[200px] overflow-y-auto rounded-lg border border-border/50 bg-background/30">
                {filteredOpenings.length > 0 ? (
                  filteredOpenings.map((op) => {
                    const isSelected = currentVideoId === op.youtubeId;
                    return (
                      <button
                        key={op.id}
                        onClick={() => handleSelectOpening(op)}
                        className={`w-full px-3 py-2 text-left transition-colors border-b border-border/30 last:border-0 ${
                          isSelected 
                            ? "bg-violet-500/20 border-l-2 border-l-violet-500" 
                            : "hover:bg-accent/30"
                        }`}
                      >
                        <div className="font-medium text-sm truncate">{op.anime}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {op.openingNumber ? `OP${op.openingNumber} - ` : ""}{op.title}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No openings found
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Matchup Selection */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            Select Matchup
          </h3>

          <div className="flex gap-4">
            {/* Team A list - 1/4 */}
            <div className="w-1/4">
              <div className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-2">
                Team A
              </div>
              <div className="h-[140px] overflow-y-auto rounded-lg border border-blue-500/30 bg-blue-500/5">
                {teamA.length > 0 ? (
                  teamA.map((player) => {
                    const isSelected = selectedPlayerA === player.id;
                    return (
                      <button
                        key={player.id}
                        onClick={() => setSelectedPlayerA(player.id)}
                        className={`w-full px-3 py-2.5 text-left transition-all border-b border-blue-500/20 last:border-0 ${
                          isSelected
                            ? "bg-blue-500/30 text-blue-300 font-semibold"
                            : "hover:bg-blue-500/10 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full border-2 ${
                            isSelected 
                              ? "border-blue-400 bg-blue-400" 
                              : "border-muted-foreground"
                          }`} />
                          <span className="truncate">{player.name}</span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3 text-xs text-muted-foreground text-center">
                    No players
                  </div>
                )}
              </div>
            </div>

            {/* Middle - Confrontation display - 1/2 */}
            <div className="w-1/2 flex items-center justify-center">
              <div className="text-center space-y-3">
                {(playerAName || playerBName) ? (
                  <>
                    <div className={`text-xl font-bold ${playerAName ? "text-blue-400" : "text-muted-foreground/50"}`}>
                      {playerAName || "Select player"}
                    </div>
                    <div className="text-2xl font-black text-muted-foreground">VS</div>
                    <div className={`text-xl font-bold ${playerBName ? "text-pink-400" : "text-muted-foreground/50"}`}>
                      {playerBName || "Select player"}
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">
                    Select one player from each team
                  </div>
                )}
              </div>
            </div>

            {/* Team B list - 1/4 */}
            <div className="w-1/4">
              <div className="text-xs font-semibold text-pink-400 uppercase tracking-wide mb-2">
                Team B
              </div>
              <div className="h-[140px] overflow-y-auto rounded-lg border border-pink-500/30 bg-pink-500/5">
                {teamB.length > 0 ? (
                  teamB.map((player) => {
                    const isSelected = selectedPlayerB === player.id;
                    return (
                      <button
                        key={player.id}
                        onClick={() => setSelectedPlayerB(player.id)}
                        className={`w-full px-3 py-2.5 text-left transition-all border-b border-pink-500/20 last:border-0 ${
                          isSelected
                            ? "bg-pink-500/30 text-pink-300 font-semibold"
                            : "hover:bg-pink-500/10 text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full border-2 ${
                            isSelected 
                              ? "border-pink-400 bg-pink-400" 
                              : "border-muted-foreground"
                          }`} />
                          <span className="truncate">{player.name}</span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-3 text-xs text-muted-foreground text-center">
                    No players
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Start Button */}
        <Button
          onClick={handlePlay}
          disabled={!currentYoutubeId || !currentMatchup}
          size="lg"
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
        >
          {!currentYoutubeId 
            ? "Select an opening to continue" 
            : !currentMatchup 
              ? "Select both players to continue"
              : "Start Round"
          }
        </Button>
      </div>
    );
  }

  // Playing / Guessing view
  if (gameState === "playing" || gameState === "guessing" || gameState === "cooldown") {
    return (
      <div className="space-y-6">
        {/* YouTube player */}
        {currentYoutubeId && (
          <Card className="p-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <YouTubePlayer
                videoId={currentYoutubeId}
                isPlaying={isPlaying}
                onReady={handleYouTubeReady}
                startTime={playStartTime}
                seekTo={seekToPosition}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={isPlaying ? handlePause : handlePlay}
                variant={isPlaying ? "destructive" : "default"}
                className="flex-1"
              >
                {isPlaying ? "Pause" : "Play"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {isPlaying ? "Audio playing for all players" : "Audio paused"}
            </p>
          </Card>
        )}

        {/* Judge decision panel */}
        {gameState === "guessing" && buzzedPlayerInfo && (
          <Card className="p-6 space-y-4 border-2 border-yellow-500/50 bg-yellow-500/5">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Player buzzed
              </p>
              <p className="text-2xl font-bold">{buzzedPlayerInfo.name}</p>
              <p className="text-sm text-muted-foreground">
                Team {buzzedPlayerInfo.team}
              </p>
            </div>

            <div className="text-center text-muted-foreground">
              Listen to their answer and decide
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => judgeDecision(true)}
                size="lg"
                className="h-16 text-xl font-bold bg-green-600 hover:bg-green-700"
              >
                Correct
              </Button>
              <Button
                onClick={() => judgeDecision(false)}
                size="lg"
                variant="destructive"
                className="h-16 text-xl font-bold"
              >
                Wrong
              </Button>
            </div>
          </Card>
        )}

        {/* Waiting state during playing */}
        {gameState === "playing" && (
          <Card className="p-6 text-center">
            <p className="text-lg text-muted-foreground">
              Opening playing - waiting for someone to buzz...
            </p>
          </Card>
        )}

        {/* Cooldown state */}
        {gameState === "cooldown" && (
          <Card className="p-6 text-center">
            <p className="text-lg text-muted-foreground">
              Player in cooldown - waiting...
            </p>
          </Card>
        )}

        {/* Skip round button */}
        <Card className="p-4">
          <Button
            onClick={skipRound}
            variant="outline"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Skip Round (No one can guess)
          </Button>
        </Card>
      </div>
    );
  }

  // Round end view
  if (gameState === "round_end") {
    return (
      <Card className="p-8 text-center space-y-6">
        <h2 className="text-xl font-bold">Round Complete</h2>
        <Button
          onClick={nextRound}
          size="lg"
          className="bg-gradient-to-r from-violet-500 to-fuchsia-500"
        >
          Next Round
        </Button>
      </Card>
    );
  }

  return null;
}
