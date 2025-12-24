// Lobby component - Team selection before game starts

import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useGame } from "../../context/GameContext";

export function Lobby() {
  const {
    roomState,
    playerId,
    roomId,
    isJudge,
    myTeam,
    selectTeam,
    startGame,
  } = useGame();

  const [targetScore, setTargetScore] = useState(5);

  if (!roomState) return null;

  const teamA = roomState.players.filter((p) => p.team === "A");
  const teamB = roomState.players.filter((p) => p.team === "B");
  const judge = roomState.players.find((p) => p.id === roomState.judgeId);
  const unassigned = roomState.players.filter(
    (p) => p.team === null && p.id !== roomState.judgeId
  );

  const canStart =
    isJudge && teamA.length >= 1 && teamB.length >= 1 && roomState.judgeId;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      {/* Room code share */}
      <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border-violet-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Share this code</p>
            <p className="text-4xl font-mono font-black tracking-widest">
              {roomId}
            </p>
          </div>
          <Button onClick={handleCopyCode} variant="outline" size="lg">
            Copy Code
          </Button>
        </div>
      </Card>

      {/* Teams grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Team A */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-blue-400">Team A</h2>
            <span className="text-sm text-muted-foreground">
              {teamA.length}/4
            </span>
          </div>

          <div className="space-y-2 min-h-[120px]">
            {teamA.map((player) => (
              <PlayerCard
                key={player.id}
                name={player.name}
                isMe={player.id === playerId}
                connected={player.connected}
              />
            ))}
            {teamA.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No players yet
              </p>
            )}
          </div>

          {myTeam !== "A" && !isJudge && teamA.length < 4 && (
            <Button
              onClick={() => selectTeam("A")}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Join Team A
            </Button>
          )}
        </Card>

        {/* Judge */}
        <Card className="p-4 space-y-4 border-2 border-violet-500/50 bg-violet-500/5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-violet-400">Judge</h2>
          </div>

          <div className="space-y-2 min-h-[120px]">
            {judge ? (
              <PlayerCard
                name={judge.name}
                isMe={judge.id === playerId}
                connected={judge.connected}
              />
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No judge selected
              </p>
            )}
          </div>

          {!isJudge && (
            <Button
              onClick={() => selectTeam("judge")}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              Become Judge
            </Button>
          )}
        </Card>

        {/* Team B */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-pink-400">Team B</h2>
            <span className="text-sm text-muted-foreground">
              {teamB.length}/4
            </span>
          </div>

          <div className="space-y-2 min-h-[120px]">
            {teamB.map((player) => (
              <PlayerCard
                key={player.id}
                name={player.name}
                isMe={player.id === playerId}
                connected={player.connected}
              />
            ))}
            {teamB.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No players yet
              </p>
            )}
          </div>

          {myTeam !== "B" && !isJudge && teamB.length < 4 && (
            <Button
              onClick={() => selectTeam("B")}
              className="w-full bg-pink-600 hover:bg-pink-700"
            >
              Join Team B
            </Button>
          )}
        </Card>
      </div>

      {/* Unassigned players */}
      {unassigned.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Waiting to join a team
          </h3>
          <div className="flex flex-wrap gap-2">
            {unassigned.map((player) => (
              <span
                key={player.id}
                className="px-3 py-1 bg-muted rounded-full text-sm"
              >
                {player.name}
                {player.id === playerId && " (you)"}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Start game (judge only) */}
      {isJudge && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold">Game Settings</h3>

          <div className="flex items-center gap-4">
            <Label htmlFor="targetScore" className="whitespace-nowrap">
              Target Score
            </Label>
            <Input
              id="targetScore"
              type="number"
              min={1}
              max={20}
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
              className="w-20 bg-background/50"
            />
            <span className="text-sm text-muted-foreground">
              First team to reach this score wins
            </span>
          </div>

          <Button
            onClick={() => startGame(targetScore)}
            disabled={!canStart}
            size="lg"
            className="w-full text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            {canStart ? "Start Game" : "Need players on both teams + judge"}
          </Button>
        </Card>
      )}

      {/* Waiting message for non-judges */}
      {!isJudge && roomState.judgeId && (
        <Card className="p-4 text-center text-muted-foreground">
          Waiting for the judge to start the game...
        </Card>
      )}
    </div>
  );
}

function PlayerCard({
  name,
  isMe,
  connected,
}: {
  name: string;
  isMe: boolean;
  connected: boolean;
}) {
  return (
    <div
      className={`px-3 py-2 rounded-lg flex items-center justify-between ${
        isMe
          ? "bg-primary text-primary-foreground"
          : "bg-muted"
      } ${!connected && "opacity-50"}`}
    >
      <span className="font-medium">
        {name}
        {isMe && " (you)"}
      </span>
      {!connected && (
        <span className="text-xs opacity-70">disconnected</span>
      )}
    </div>
  );
}
