import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@/utils/logger';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  encrypt?: boolean;
}

interface CacheEntry<T> {
  data: T;
  expiresAt?: number;
}

/**
 * Simple cache service for storing temporary data
 * Uses AsyncStorage for React Native
 */
export class CacheService {
  private prefix = '@app_cache:';

  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.prefix + key;
      const item = await AsyncStorage.getItem(fullKey);

      if (!item) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(item);

      // Check if expired
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        await this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      logger.error('Cache get error', { error, key });
      return null;
    }
  }

  async set<T>(key: string, data: T, options?: CacheOptions): Promise<void> {
    try {
      const fullKey = this.prefix + key;
      const entry: CacheEntry<T> = {
        data,
        expiresAt: options?.ttl ? Date.now() + (options.ttl * 1000) : undefined,
      };

      await AsyncStorage.setItem(fullKey, JSON.stringify(entry));
    } catch (error) {
      logger.error('Cache set error', { error, key });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.prefix + key;
      await AsyncStorage.removeItem(fullKey);
    } catch (error) {
      logger.error('Cache delete error', { error, key });
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

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async getMany<T>(keys: string[]): Promise<Map<string, T>> {
    const result = new Map<string, T>();

    for (const key of keys) {
      const value = await this.get<T>(key);
      if (value !== null) {
        result.set(key, value);
      }
    }

    return result;
  }

  async setMany<T>(entries: Map<string, T>, options?: CacheOptions): Promise<void> {
    for (const [key, value] of entries) {
      await this.set(key, value, options);
    }
  }
}
