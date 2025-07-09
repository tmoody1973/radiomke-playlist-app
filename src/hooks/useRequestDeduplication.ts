import { useRef } from 'react';

interface RequestMap {
  [key: string]: Promise<any>;
}

export const useRequestDeduplication = () => {
  const activeRequests = useRef<RequestMap>({});

  const deduplicateRequest = async <T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = 5000
  ): Promise<T> => {
    // If we already have an active request for this key, return it
    if (activeRequests.current[key]) {
      console.log(`🔄 Deduplicating request for key: ${key}`);
      return activeRequests.current[key];
    }

    console.log(`🚀 New request for key: ${key}`);
    
    // Create the request promise
    const requestPromise = requestFn();
    
    // Store it in active requests
    activeRequests.current[key] = requestPromise;
    
    // Clean up after completion or TTL
    const cleanup = () => {
      delete activeRequests.current[key];
    };
    
    requestPromise
      .then(cleanup)
      .catch(cleanup);
    
    // Auto cleanup after TTL
    setTimeout(cleanup, ttl);
    
    return requestPromise;
  };

  return { deduplicateRequest };
};