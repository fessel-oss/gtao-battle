# Architecture

Technical documentation for GTAO Battle (Guess The Anime Opening).

## Stack

- **Runtime**: [Bun](https://bun.sh) - fast all-in-one JavaScript runtime
- **Frontend**: React with TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Bun.serve() with WebSocket support
- **Audio**: YouTube IFrame Player API (audio-only for players)

## Why Server-Based (Not P2P)?

We chose a server-authoritative architecture because:

1. **Buzzer timing** - Server determines who buzzed first (race conditions)
2. **Judge control** - Central point for game state management
3. **Synchronized playback** - All clients play from the same position
4. **Multiple players** - P2P with 2+ players gets complex quickly

The server is the single source of truth. Clients send actions, server validates and broadcasts state changes.

## Code Structure (Ports & Adapters)

The game logic is decoupled from infrastructure using interfaces. This allows swapping implementations (e.g., Redis for rooms, external timer service for serverless).

```
src/
├── core/                    # Pure game logic (no I/O)
│   ├── types.ts            # Domain types (Room, Player, GameState)
│   ├── messages.ts         # WebSocket message types
│   ├── game-logic.ts       # Pure functions (canBuzz, isJudge, etc.)
│   └── game-machine.ts     # State machine & message handlers
│
├── ports/                   # Interface definitions
│   ├── room-store.ts       # Room persistence interface
│   ├── connection-manager.ts # WebSocket connections interface
│   └── timer-service.ts    # Timers/delays interface
│
├── adapters/memory/         # In-memory implementations
│   ├── room-store.ts       # Map-based room storage
│   ├── connection-manager.ts # WebSocket tracking
│   └── timer-service.ts    # setTimeout-based timers
│
├── server/
│   └── websocket-handler.ts # WebSocket upgrade & routing
│
├── components/game/         # React components
│   ├── PlayerView.tsx      # Player UI with buzzer
│   ├── JudgePanel.tsx      # Judge control panel
│   └── YouTubePlayer.tsx   # YouTube embed wrapper
│
├── context/
│   └── GameContext.tsx     # React context for game state
│
├── hooks/
│   ├── useGameSocket.ts    # WebSocket connection hook
│   └── useYouTube.ts       # YouTube player hook
│
└── db.ts                    # Anime openings database
```

### Key Interfaces

**RoomStore** - Persistence for game rooms:
```typescript
interface RoomStore {
  create(room: Room): Promise<void>;
  get(roomId: string): Promise<Room | null>;
  update(roomId: string, updater: (room: Room) => Room): Promise<void>;
  delete(roomId: string): Promise<void>;
}
```

**ConnectionManager** - WebSocket connection tracking:
```typescript
interface ConnectionManager {
  add(playerId: string, roomId: string, ws: WebSocket): void;
  remove(playerId: string): void;
  send(playerId: string, message: ServerMessage): void;
  broadcast(roomId: string, message: ServerMessage): void;
}
```

**TimerService** - Delayed operations (cooldowns):
```typescript
interface TimerService {
  schedule(key: string, callback: () => void, delayMs: number): void;
  cancel(key: string): void;
  cancelAll(prefix: string): void;
}
```

## Game State Machine

```
                              ┌─────────────┐
                              │    lobby    │
                              └──────┬──────┘
                                     │ start_game
                              ┌──────▼──────┐
                    ┌────────►│ round_setup │◄────────┐
                    │         └──────┬──────┘         │
                    │                │ play_song      │
                    │         ┌──────▼──────┐         │
                    │    ┌───►│   playing   │         │
                    │    │    └──────┬──────┘         │
                    │    │           │ buzz           │
                    │    │    ┌──────▼──────┐         │
                    │    │    │   guessing  │         │
                    │    │    └──────┬──────┘         │
                    │    │           │                │
                    │    │     ┌─────┴─────┐          │
                    │    │     │           │          │
                    │    │  correct     wrong         │
                    │    │     │           │          │
                    │    │     │    ┌──────▼──────┐   │
                    │    │     │    │  cooldown   │   │
                    │    │     │    └──────┬──────┘   │
                    │    │     │           │          │
                    │    │     │           │ resume   │
                    │    │     │           └──────────┘
                    │    │     │
                    │    │     ▼
                    │    │  ┌──────────┐    next_round
                    │    │  │round_end │───────────────┘
                    │    │  └────┬─────┘
                    │    │       │
                    │    │       │ target reached
                    │    │       ▼
                    │    │  ┌──────────┐
                    │    │  │game_over │
                    │    │  └──────────┘
                    │    │
                    │    └── wrong + opponent still active
                    │
                    └── skip_round
```

### States

| State | Description |
|-------|-------------|
| `lobby` | Players joining and selecting teams |
| `round_setup` | Judge setting opening and matchup |
| `playing` | Opening playing, waiting for a player to buzz |
| `guessing` | Someone buzzed, waiting for judge's decision |
| `cooldown` | Wrong guess, player temporarily blocked (5s) |
| `round_end` | Round finished, preparing for next |
| `game_over` | Target score reached, winner declared |

### Transitions

| From | Event | To | Condition |
|------|-------|-----|-----------|
| lobby | start_game | round_setup | Both teams have players |
| round_setup | play_song | playing | Opening & matchup set |
| playing | buzz | guessing | Valid player, not in cooldown |
| playing | skip_round | round_end | Judge action |
| guessing | judge_decision(correct) | round_end | - |
| guessing | judge_decision(wrong) | playing | Opponent can still guess |
| guessing | judge_decision(wrong) | round_end | Both players in cooldown |
| round_end | next_round | round_setup | Score < target |
| round_end | - | game_over | Score >= target |

## Synchronized YouTube Playback

Keeping audio in sync across clients is the trickiest part. Here's our approach:

### Server-Side Tracking

The room stores playback state:
```typescript
interface Room {
  // ...
  songStartedAt: number | null;  // timestamp when play started
  songPausedAt: number | null;   // timestamp when paused
  songPosition: number;          // position in seconds
}
```

### Play/Pause Messages

When the judge plays:
```typescript
{ type: "play", startTime: number, seekTo: number }
```
- `startTime`: Future timestamp (Date.now() + small delay) for all clients to start together
- `seekTo`: Position in seconds to seek before playing

When pausing (buzz or manual):
```typescript
{ type: "pause", position: number }
```

### Handling Missed Messages

Problem: If a client misses a `play` message (network hiccup, React effect timing), they're desynchronized.

Solution: The `room_state` broadcast includes:
```typescript
interface RoomState {
  // ...
  isPlaying: boolean;
  songPosition: number;
}
```

Clients check on every `room_state`:
```typescript
if (roomState.isPlaying !== localIsPlaying) {
  // Resync: seek to songPosition and play/pause
}
```

### Buzz -> Wrong -> Resume Flow

1. Player buzzes -> server pauses, saves position
2. Judge marks wrong -> server broadcasts `play` with saved position
3. All clients seek to position and resume together

## WebSocket Protocol

### Client -> Server

| Message | Description |
|---------|-------------|
| `create_room` | Create new room, become judge |
| `join_room` | Join existing room by code |
| `select_team` | Choose Team A, B, or judge |
| `start_game` | Judge starts the game |
| `set_song` | Judge sets YouTube URL |
| `set_matchup` | Judge selects 1v1 players |
| `play_song` | Judge starts playback |
| `pause_song` | Judge pauses playback |
| `buzz` | Player buzzes to guess |
| `judge_decision` | Judge marks correct/wrong |
| `skip_round` | Judge skips current round |
| `next_round` | Start next round |
| `new_game` | Reset for new game |

### Server -> Client

| Message | Description |
|---------|-------------|
| `room_created` | Room created, includes room code |
| `room_joined` | Successfully joined room |
| `room_state` | Full state sync |
| `player_joined` | New player joined |
| `player_left` | Player disconnected |
| `game_started` | Game has begun |
| `round_setup` | New round, matchup selected |
| `song_ready` | YouTube ID extracted |
| `play` | Start playback at position |
| `pause` | Stop playback |
| `player_buzzed` | Someone buzzed |
| `guess_result` | Correct or wrong |
| `cooldown_start` | Player in cooldown |
| `cooldown_end` | Cooldown finished |
| `point_scored` | Team scored |
| `round_end` | Round finished |
| `game_over` | Game finished |

## Anime Openings Database

The `src/db.ts` file contains 100+ popular anime openings with:
- Anime name
- Opening title and number (OP1, OP2, etc.)
- Artist
- YouTube video ID

Helper functions:
- `searchOpenings(query)` - Search by anime, title, or artist
- `getYouTubeUrl(youtubeId)` - Convert ID to full URL
- `getRandomOpening()` - Get a random opening
- `getOpeningsForAnime(anime)` - Get all openings for an anime

## Deployment Considerations

### Current: Single Server (In-Memory)

Good for development and small deployments. All state lives in memory.

### Scaling: Multiple Servers

To scale horizontally, swap adapters:

1. **RoomStore** -> Redis or database
2. **ConnectionManager** -> Redis pub/sub for cross-server broadcasts
3. **TimerService** -> External scheduler (or Redis-based)

The ports/adapters pattern makes this straightforward without touching game logic.

### Serverless

The architecture supports serverless with some modifications:
- WebSocket connections via API Gateway
- Room state in DynamoDB/Redis
- Timers via scheduled Lambda or Step Functions
