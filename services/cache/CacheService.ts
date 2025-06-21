import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/utils/logger';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * Simple cache service using AsyncStorage
 */
export class CacheService {
  private prefix = '@zenith_cache:';

  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.prefix + key;
      const item = await AsyncStorage.getItem(fullKey);
      
      if (!item) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(item);
      
      // Check if expired
      if (Date.now() > entry.expiresAt) {
        await this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      logger.error('Cache get error', { key, error });
      return null;
    }
  }

  async set<T>(key: string, data: T, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.prefix + key;
      const ttl = options?.ttl || 3600; // Default 1 hour
      
      const entry: CacheEntry<T> = {
        data,
        expiresAt: Date.now() + (ttl * 1000),
      };

      await AsyncStorage.setItem(fullKey, JSON.stringify(entry));
    } catch (error) {
      logger.error('Cache set error', { key, error });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.prefix + key;
      await AsyncStorage.removeItem(fullKey);
    } catch (error) {
      logger.error('Cache delete error', { key, error });
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.prefix));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      logger.error('Cache clear error', { error });
    }
  }
}
