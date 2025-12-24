# GTAO Battle

**Guess The Anime Opening** - A real-time multiplayer game where two teams compete to identify anime openings. Players race to buzz in and name the opening while a judge controls the game flow.

## How to Play

### Setup
1. One player creates a room and becomes the **Judge**
2. Other players join using the room code
3. Players choose their team: **Team A** or **Team B** (1-4 players per team)
4. The judge starts the game and sets a target score (first team to reach it wins)

### Game Flow
1. **Round Setup**: Judge selects an anime opening from the database (or pastes a custom YouTube URL) and picks one player from each team for the 1v1 matchup
2. **Playing**: Judge clicks play - all players hear the opening (audio only, no video for players)
3. **Buzzing**: Either player can press **SPACEBAR** or click the buzzer to guess
4. **Guessing**: The buzzer stops the audio. The player says their guess out loud (via Discord, etc.)
5. **Judging**: The judge marks the guess as correct or wrong:
   - **Correct**: Player's team scores a point, round ends
   - **Wrong**: Player enters a 5-second cooldown, audio resumes, opponent can still guess
6. **Round End**: Judge can start a new round or skip if no one guesses correctly
7. **Game Over**: First team to reach the target score wins

### Key Rules
- Matchups are always **1v1** between one player from each team
- Only the two players in the current matchup can buzz
- Wrong guesses result in a **5-second cooldown** for that player
- The judge can **skip** a round if needed
- Players only hear audio - the video is hidden to prevent visual hints

## Running the Game

### Prerequisites
- [Bun](https://bun.sh) v1.0+

### Install & Run
```bash
bun install
bun dev
```

The server starts at `http://localhost:3000`

### Production
```bash
bun start
```

## Anime Openings Database

The game includes a built-in database of 100+ popular anime openings in `src/db.ts`. The judge can search by anime name, opening title, or artist. Custom YouTube URLs are also supported.

## Technical Details

See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical decisions, state machine documentation, and code structure.
