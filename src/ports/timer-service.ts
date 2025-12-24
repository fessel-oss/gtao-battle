// Interface for scheduling delayed actions
// Can be implemented with setTimeout or distributed timers

export interface TimerService {
  /**
   * Schedule a callback to run after a delay
   * @param id - Unique identifier for this timer (for cancellation)
   * @param delayMs - Delay in milliseconds
   * @param callback - Function to call when timer fires
   */
  schedule(id: string, delayMs: number, callback: () => void): void;

  /**
   * Cancel a scheduled timer by ID
   */
  cancel(id: string): void;

  /**
   * Cancel all timers that start with a prefix
   * Useful for cleaning up all timers for a room (e.g., "room:ABCD:")
   */
  cancelAll(prefix: string): void;

  /**
   * Check if a timer exists
   */
  exists(id: string): boolean;
}


