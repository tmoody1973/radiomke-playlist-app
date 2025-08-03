// Performance optimization settings
export const OPTIMIZATION_CONFIG = {
  // Disable auto-loading of events to reduce API calls
  LAZY_LOAD_EVENTS: true,
  
  // Intersection observer settings
  INTERSECTION_THRESHOLD: 0.1,
  INTERSECTION_ROOT_MARGIN: '50px',
  
  // Cache durations (in milliseconds)
  EVENTS_CACHE_DURATION: 1000 * 60 * 60 * 24, // 24 hours
  YOUTUBE_CACHE_DURATION: 1000 * 60 * 60 * 24 * 7, // 7 days
  
  // Rate limiting (in milliseconds)
  MIN_TIME_BETWEEN_API_CALLS: 30000, // 30 seconds
  
  // Batch processing
  MAX_CONCURRENT_REQUESTS: 3,
} as const;