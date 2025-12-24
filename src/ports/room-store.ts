// Interface for room storage
// Can be implemented with in-memory Map, Redis, or any other storage

import type { Room } from "../core/types";

export interface RoomStore {
  /**
   * Create a new room
   */
  create(room: Room): Promise<void>;

  /**
   * Get a room by ID, returns null if not found
   */
  get(roomId: string): Promise<Room | null>;

  /**
   * Update a room atomically using an updater function
   * Returns the updated room
   * Throws if room doesn't exist
   */
  update(roomId: string, updater: (room: Room) => Room): Promise<Room>;

  /**
   * Delete a room
   */
  delete(roomId: string): Promise<void>;

  /**
   * Check if a room exists
   */
  exists(roomId: string): Promise<boolean>;

  /**
   * Get all room IDs (useful for cleanup)
   */
  getAllIds(): Promise<string[]>;
}


