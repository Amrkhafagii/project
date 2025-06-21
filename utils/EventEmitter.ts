/**
 * Generic event emitter for pub/sub pattern
 */
export class EventEmitter<T> {
  private events: Map<string, Set<(data: T) => void>> = new Map();

  on(event: string, callback: (data: T) => void): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    this.events.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.events.get(event)?.delete(callback);
    };
  }

  emit(event: string, data: T): void {
    // Emit to specific event listeners
    this.events.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
    
    // Emit to wildcard listeners
    this.events.get('*')?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in wildcard event listener:', error);
      }
    });
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}
