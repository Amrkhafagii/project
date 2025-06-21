import NetInfo from '@react-native-community/netinfo';

export class NetworkUtils {
  static async isConnected(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }

  static subscribeToNetworkChanges(callback: (isConnected: boolean) => void) {
    return NetInfo.addEventListener(state => {
      callback(state.isConnected ?? false);
    });
  }

  static async checkInternetReachability(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isInternetReachable ?? false;
  }
}
