// In-memory implementation of TimerService
// Uses setTimeout for single-instance deployment

import type { TimerService } from "../../ports/timer-service";

export class MemoryTimerService implements TimerService {
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  schedule(id: string, delayMs: number, callback: () => void): void {
    // Cancel existing timer with same ID if any
    this.cancel(id);

    const timer = setTimeout(() => {
      this.timers.delete(id);
      callback();
    }, delayMs);

    this.timers.set(id, timer);
  }

  cancel(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }

  cancelAll(prefix: string): void {
    for (const [id, timer] of this.timers) {
      if (id.startsWith(prefix)) {
        clearTimeout(timer);
        this.timers.delete(id);
      }
    }
  }

  exists(id: string): boolean {
    return this.timers.has(id);
  }
}


