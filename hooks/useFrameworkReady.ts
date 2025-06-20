import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useFrameworkReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // For web, we need to ensure the DOM is ready
    if (Platform.OS === 'web') {
      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setIsReady(true);
      } else {
        const handleLoad = () => setIsReady(true);
        window.addEventListener('DOMContentLoaded', handleLoad);
        return () => window.removeEventListener('DOMContentLoaded', handleLoad);
      }
    } else {
      // For native platforms, we're ready immediately
      setIsReady(true);
    }
  }, []);

  return isReady;
}
