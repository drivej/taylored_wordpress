export class EventEmitter<T extends string, C> {
  private events: Partial<{
    [K in T]: Array<(args: { type: T; ref: C }) => void>;
  }> = {};

  on(event: T, callback: (args: { type: T; ref: C }) => void) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event]?.push(callback);
  }

  emit(event: T, payload?: unknown) {
    const callbacks = this.events[event];
    if (callbacks) {
      const eventData = { type: event, ref: this as unknown as C, payload };
      for (const callback of callbacks) {
        callback.bind(this)(eventData);
      }
    }
  }

  off(event: T, callback: (args: { type: T; ref: C }) => void) {
    const callbacks = this.events[event];
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}
