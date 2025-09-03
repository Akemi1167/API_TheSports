/**
 * TheSports API Configuration
 * Centralized configuration for TheSports API integration
 */

const API_CONFIG = {
  // Base URL for TheSports API
  BASE_URL: 'https://api.thesports.com/v1/football',
  
  // Default request parameters
  DEFAULT_PARAMS: {
    // Add any default parameters here if needed
    // For example: api_key, format, etc.
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 30000, // 30 seconds
  
  // Rate limiting configuration
  RATE_LIMIT: {
    MAX_REQUESTS_PER_MINUTE: 120,
    DELAY_BETWEEN_REQUESTS: 500 // 500ms delay
  },
  
  // API Endpoints
  ENDPOINTS: {
    CATEGORIES: '/category',
    COUNTRIES: '/country', 
    COMPETITIONS: '/competition',
    TEAMS: '/team',
    PLAYERS: '/player',
    COACHES: '/coach',
    REFEREES: '/referee',
    VENUES: '/venue',
    SEASONS: '/season',
    STAGES: '/stage',
    VIDEO_STREAMS: '/video_stream',
    REAL_TIME_DATA: '/real_time',
    HEAD_TO_HEAD: '/h2h',
    STANDINGS: '/standing',
    LINEUPS: '/match/lineup/detail'
  },
  
  // Pagination configuration
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 50,
    MAX_PAGE_SIZE: 100
  },
  
  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // 1 second
    BACKOFF_FACTOR: 2 // Exponential backoff
  },
  
  // Data validation rules
  VALIDATION: {
    MAX_DATE_RANGE_DAYS: 30, // Maximum date range for queries
    MIN_MATCH_ID_LENGTH: 3,
    MAX_MATCH_ID_LENGTH: 50
  }
};

/**
 * Build full API URL
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {string} Full API URL
 */
function buildApiUrl(endpoint, params = {}) {
  const url = new URL(endpoint, API_CONFIG.BASE_URL);
  
  // Add default parameters
  Object.entries(API_CONFIG.DEFAULT_PARAMS).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  // Add custom parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.append(key, value);
    }
  });
  
  return url.toString();
}

/**
 * Get request configuration with default settings
 * @param {Object} customConfig - Custom axios configuration
 * @returns {Object} Complete request configuration
 */
function getRequestConfig(customConfig = {}) {
  return {
    timeout: API_CONFIG.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'TheSports-API-Client/1.0'
    },
    ...customConfig
  };
}

/**
 * Calculate delay for rate limiting
 * @param {number} requestCount - Current request count
 * @returns {number} Delay in milliseconds
 */
function calculateRateLimit(requestCount = 0) {
  const baseDelay = API_CONFIG.RATE_LIMIT.DELAY_BETWEEN_REQUESTS;
  const maxRequestsPerMinute = API_CONFIG.RATE_LIMIT.MAX_REQUESTS_PER_MINUTE;
  
  // If approaching rate limit, increase delay
  if (requestCount > maxRequestsPerMinute * 0.8) {
    return baseDelay * 2;
  }
  
  return baseDelay;
}

/**
 * Validate date range for API requests
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {boolean} True if valid range
 */
function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) return false;
  
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= API_CONFIG.VALIDATION.MAX_DATE_RANGE_DAYS;
}

/**
 * Validate match ID format
 * @param {string} matchId - Match ID to validate
 * @returns {boolean} True if valid format
 */
function validateMatchId(matchId) {
  if (!matchId || typeof matchId !== 'string') return false;
  
  const length = matchId.length;
  return length >= API_CONFIG.VALIDATION.MIN_MATCH_ID_LENGTH && 
         length <= API_CONFIG.VALIDATION.MAX_MATCH_ID_LENGTH;
}

/**
 * Get retry delay with exponential backoff
 * @param {number} attempt - Current attempt number (0-based)
 * @returns {number} Delay in milliseconds
 */
function getRetryDelay(attempt) {
  const baseDelay = API_CONFIG.RETRY.DELAY;
  const backoffFactor = API_CONFIG.RETRY.BACKOFF_FACTOR;
  
  return baseDelay * Math.pow(backoffFactor, attempt);
}

/**
 * Environment-specific configurations
 */
const ENV_CONFIG = {
  development: {
    ...API_CONFIG,
    TIMEOUT: 60000, // Longer timeout for development
    RATE_LIMIT: {
      ...API_CONFIG.RATE_LIMIT,
      DELAY_BETWEEN_REQUESTS: 100 // Faster requests in dev
    }
  },
  
  production: {
    ...API_CONFIG,
    RATE_LIMIT: {
      ...API_CONFIG.RATE_LIMIT,
      DELAY_BETWEEN_REQUESTS: 600 // More conservative in production
    }
  },
  
  test: {
    ...API_CONFIG,
    BASE_URL: 'http://localhost:3001', // Mock server for testing
    TIMEOUT: 5000
  }
};

/**
 * Get configuration based on environment
 * @returns {Object} Environment-specific configuration
 */
function getConfig() {
  const env = process.env.NODE_ENV || 'development';
  return ENV_CONFIG[env] || API_CONFIG;
}

module.exports = {
  API_CONFIG: getConfig(),
  buildApiUrl,
  getRequestConfig,
  calculateRateLimit,
  validateDateRange,
  validateMatchId,
  getRetryDelay
};
