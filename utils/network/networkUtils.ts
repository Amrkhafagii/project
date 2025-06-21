import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { logger } from '@/utils/logger';

export interface NetworkInfo {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  details?: any;
}

/**
 * Network utility functions
 */
export class NetworkUtils {
  private static networkState: NetInfoState | null = null;
  private static listeners: Set<(state: NetInfoState) => void> = new Set();
  private static unsubscribe: (() => void) | null = null;

  static initialize(): void {
    if (this.unsubscribe) {
      return;
    }

    this.unsubscribe = NetInfo.addEventListener(state => {
      this.networkState = state;
      this.listeners.forEach(listener => {
        try {
          listener(state);
        } catch (error) {
          logger.error('Network listener error', { error });
        }
      });
    });

    // Get initial state
    NetInfo.fetch().then(state => {
      this.networkState = state;
    });
  }

  static async getNetworkInfo(): Promise<NetworkInfo | null> {
    try {
      const state = await NetInfo.fetch();
      
      return {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
        details: state.details,
      };
    } catch (error) {
      logger.error('Failed to get network info', { error });
      return null;
    }
  }

  static async isConnected(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? false;
    } catch (error) {
      logger.error('Failed to check connection', { error });
      return false;
    }
  }

  static onNetworkChange(callback: (info: NetworkInfo) => void): () => void {
    const listener = (state: NetInfoState) => {
      callback({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: state.type,
        details: state.details,
      });
    };

    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  static cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners.clear();
    this.networkState = null;
  }
}

// Initialize on import
NetworkUtils.initialize();
