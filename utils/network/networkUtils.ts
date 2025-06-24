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
  private static listeners: Set<(isConnected: boolean) => void> = new Set();
  private static unsubscribe: (() => void) | null = null;

  static initialize(): void {
    if (this.unsubscribe) {
      return;
    }

    this.unsubscribe = NetInfo.addEventListener(state => {
      this.networkState = state;
      this.listeners.forEach(listener => {
        try {
          listener(state.isConnected ?? false);
        } catch (error) {
          logger.error('Network listener error', { error });
        }
      });
    });

    // Get initial state
    NetInfo.fetch().then(state => {
      this.networkState = state;
    }).catch(error => {
      logger.error('Failed to fetch initial network state', { error });
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

  static subscribeToNetworkChanges(callback: (isConnected: boolean) => void): () => void {
    // Initialize if not already done
    this.initialize();
    
    // Add the listener
    this.listeners.add(callback);
    
    // If we already have a state, call the callback immediately
    if (this.networkState) {
      callback(this.networkState.isConnected ?? false);
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
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

    // Initialize if not already done
    this.initialize();

    this.unsubscribe = NetInfo.addEventListener(listener);
    
    return () => {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
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
