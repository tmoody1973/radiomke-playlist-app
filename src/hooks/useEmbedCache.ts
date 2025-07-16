import { useState, useEffect, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
}

export const useEmbedCache = <T>(
  key: string, 
  config: CacheConfig = {}
) => {
  const { ttl = 5 * 60 * 1000, maxSize = 50 } = config; // 5 minutes default TTL
  
  const getCacheKey = (suffix: string) => `embed_cache_${key}_${suffix}`;
  
  const get = useCallback((cacheKey: string): T | null => {
    try {
      const cached = localStorage.getItem(getCacheKey(cacheKey));
      if (!cached) return null;
      
      const item: CacheItem<T> = JSON.parse(cached);
      
      // Check if expired
      if (Date.now() > item.expiresAt) {
        localStorage.removeItem(getCacheKey(cacheKey));
        return null;
      }
      
      return item.data;
    } catch (error) {
      console.warn('Cache get error:', error);
      return null;
    }
  }, [key]);
  
  const set = useCallback((cacheKey: string, data: T) => {
    try {
      // Clean up old entries if we're at max size
      const allKeys = Object.keys(localStorage).filter(k => k.startsWith(`embed_cache_${key}_`));
      if (allKeys.length >= maxSize) {
        // Remove oldest entries
        const itemsWithTime = allKeys.map(k => {
          try {
            const item = JSON.parse(localStorage.getItem(k) || '{}');
            return { key: k, timestamp: item.timestamp || 0 };
          } catch {
            return { key: k, timestamp: 0 };
          }
        }).sort((a, b) => a.timestamp - b.timestamp);
        
        // Remove oldest half
        const toRemove = itemsWithTime.slice(0, Math.floor(maxSize / 2));
        toRemove.forEach(({ key }) => localStorage.removeItem(key));
      }
      
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl
      };
      
      localStorage.setItem(getCacheKey(cacheKey), JSON.stringify(item));
    } catch (error) {
      console.warn('Cache set error:', error);
    }
  }, [key, ttl, maxSize]);
  
  const remove = useCallback((cacheKey: string) => {
    try {
      localStorage.removeItem(getCacheKey(cacheKey));
    } catch (error) {
      console.warn('Cache remove error:', error);
    }
  }, [key]);
  
  const clear = useCallback(() => {
    try {
      const allKeys = Object.keys(localStorage).filter(k => k.startsWith(`embed_cache_${key}_`));
      allKeys.forEach(k => localStorage.removeItem(k));
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }, [key]);
  
  return { get, set, remove, clear };
};

// Specialized hook for demo configuration persistence
export const useConfigCache = () => {
  const [savedConfig, setSavedConfig] = useState<any>(null);
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem('embed_demo_config');
      if (saved) {
        setSavedConfig(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load saved config:', error);
    }
  }, []);
  
  const saveConfig = useCallback((config: any) => {
    try {
      localStorage.setItem('embed_demo_config', JSON.stringify(config));
      setSavedConfig(config);
    } catch (error) {
      console.warn('Failed to save config:', error);
    }
  }, []);
  
  const clearConfig = useCallback(() => {
    try {
      localStorage.removeItem('embed_demo_config');
      setSavedConfig(null);
    } catch (error) {
      console.warn('Failed to clear config:', error);
    }
  }, []);
  
  return { savedConfig, saveConfig, clearConfig };
};