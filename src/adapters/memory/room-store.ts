// In-memory implementation of RoomStore
// Uses a simple Map for storage - suitable for single-instance deployment

import type { Room } from "../../core/types";
import type { RoomStore } from "../../ports/room-store";

export class MemoryRoomStore implements RoomStore {
  private rooms: Map<string, Room> = new Map();

  async create(room: Room): Promise<void> {
    if (this.rooms.has(room.id)) {
      throw new Error(`Room ${room.id} already exists`);
    }
    // Deep clone to prevent external mutations
    this.rooms.set(room.id, this.clone(room));
  }

  async get(roomId: string): Promise<Room | null> {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    // Return a clone to prevent external mutations
    return this.clone(room);
  }

  async update(roomId: string, updater: (room: Room) => Room): Promise<Room> {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`Room ${roomId} not found`);
    }

    // Apply update directly to stored room (atomic in single-threaded JS)
    const updated = updater(room);
    this.rooms.set(roomId, updated);

    return this.clone(updated);
  }

  async delete(roomId: string): Promise<void> {
    this.rooms.delete(roomId);
  }

  async exists(roomId: string): Promise<boolean> {
    return this.rooms.has(roomId);
  }

  async getAllIds(): Promise<string[]> {
    return Array.from(this.rooms.keys());
  }

  // Deep clone a room to prevent mutations
  private clone(room: Room): Room {
    return {
      ...room,
      players: new Map(room.players),
      cooldowns: new Set(room.cooldowns),
      scores: { ...room.scores },
      currentMatchup: room.currentMatchup
        ? { ...room.currentMatchup }
        : null,
    };
  }
}


