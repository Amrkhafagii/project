import { io, Socket } from 'socket.io-client';
import { logger } from '@/utils/logger';

interface RealTimeConfig {
  url: string;
  options?: any;
}

type EventCallback = (data: any) => void;

class RealTimeManager {
  private socket: Socket | null = null;
  private config: RealTimeConfig;
  private eventHandlers: Map<string, Set<EventCallback>> = new Map();
  private isConnected: boolean = false;

  constructor(config: RealTimeConfig) {
    this.config = config;
  }

  connect(): void {
    if (this.socket?.connected) {
      logger.info('Already connected to real-time service');
      return;
    }

    try {
      this.socket = io(this.config.url, {
        ...this.config.options,
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.setupEventListeners();
      logger.info('Connecting to real-time service', { url: this.config.url });
    } catch (error) {
      logger.error('Failed to connect to real-time service', { error });
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      logger.info('Connected to real-time service');
      this.emit('connection', { status: 'connected' });
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      logger.info('Disconnected from real-time service');
      this.emit('connection', { status: 'disconnected' });
    });

    this.socket.on('error', (error) => {
      logger.error('Real-time connection error', { error });
      this.emit('error', { error });
    });

    // Listen for all events and forward to subscribers
    this.socket.onAny((event, data) => {
      this.emit(event, data);
    });
  }

  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(callback);
        if (handlers.size === 0) {
          this.eventHandlers.delete(event);
        }
      }
    };
  }

  emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          logger.error('Error in event handler', { event, error });
        }
      });
    }
  }

  send(event: string, data: any): void {
    if (!this.socket || !this.isConnected) {
      logger.warn('Cannot send event, not connected', { event });
      return;
    }

    this.socket.emit(event, data);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventHandlers.clear();
      logger.info('Disconnected from real-time service');
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
let realTimeManager: RealTimeManager | null = null;

export function initializeRealTimeManager(config: RealTimeConfig): RealTimeManager {
  if (!realTimeManager) {
    realTimeManager = new RealTimeManager(config);
  }
  return realTimeManager;
}

export function getRealTimeManager(): RealTimeManager | null {
  return realTimeManager;
}
