/**
 * Timestamp Utilities for converting Unix timestamps to readable datetime
 */

/**
 * Convert Unix timestamp to readable Vietnamese datetime
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {boolean} includeSeconds - Include seconds in output (default: true)
 * @returns {string} Formatted datetime string
 */
const timestampToDateTime = (timestamp, includeSeconds = true) => {
  if (!timestamp || timestamp === 0) return 'N/A';
  
  try {
    // Convert Unix timestamp (seconds) to Date
    const date = new Date(timestamp * 1000);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    // Format theo timezone Việt Nam (UTC+7)
    const options = {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    
    if (includeSeconds) {
      options.second = '2-digit';
    }
    
    return date.toLocaleString('vi-VN', options);
  } catch (error) {
    console.error('Error converting timestamp:', error);
    return 'Error';
  }
};

/**
 * Convert Unix timestamp to ISO string
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} ISO datetime string
 */
const timestampToISO = (timestamp) => {
  if (!timestamp || timestamp === 0) return null;
  
  try {
    const date = new Date(timestamp * 1000);
    return date.toISOString();
  } catch (error) {
    console.error('Error converting timestamp to ISO:', error);
    return null;
  }
};

/**
 * Convert Unix timestamp to date only (no time)
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Date string (DD/MM/YYYY)
 */
const timestampToDate = (timestamp) => {
  if (!timestamp || timestamp === 0) return 'N/A';
  
  try {
    const date = new Date(timestamp * 1000);
    
    const options = {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    };
    
    return date.toLocaleDateString('vi-VN', options);
  } catch (error) {
    console.error('Error converting timestamp to date:', error);
    return 'Error';
  }
};

/**
 * Convert Unix timestamp to time only (no date)
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string} Time string (HH:mm:ss)
 */
const timestampToTime = (timestamp) => {
  if (!timestamp || timestamp === 0) return 'N/A';
  
  try {
    const date = new Date(timestamp * 1000);
    
    const options = {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    
    return date.toLocaleTimeString('vi-VN', options);
  } catch (error) {
    console.error('Error converting timestamp to time:', error);
    return 'Error';
  }
};

/**
 * Get current Unix timestamp
 * @returns {number} Current Unix timestamp in seconds
 */
const getCurrentTimestamp = () => {
  return Math.floor(Date.now() / 1000);
};

/**
 * Convert Date object to Unix timestamp
 * @param {Date} date - Date object
 * @returns {number} Unix timestamp in seconds
 */
const dateToTimestamp = (date) => {
  if (!(date instanceof Date)) return 0;
  return Math.floor(date.getTime() / 1000);
};

/**
 * Check if timestamp is in the past
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {boolean} True if timestamp is in the past
 */
const isInPast = (timestamp) => {
  return timestamp < getCurrentTimestamp();
};

/**
 * Check if timestamp is in the future
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {boolean} True if timestamp is in the future
 */
const isInFuture = (timestamp) => {
  return timestamp > getCurrentTimestamp();
};

/**
 * Get time difference in minutes
 * @param {number} timestamp1 - First timestamp
 * @param {number} timestamp2 - Second timestamp (default: current time)
 * @returns {number} Difference in minutes
 */
const getTimeDifferenceInMinutes = (timestamp1, timestamp2 = getCurrentTimestamp()) => {
  return Math.floor(Math.abs(timestamp2 - timestamp1) / 60);
};

/**
 * Format match time for display
 * @param {number} matchTime - Match timestamp
 * @returns {object} Formatted match time info
 */
const formatMatchTime = (matchTime) => {
  const currentTime = getCurrentTimestamp();
  const diffMinutes = getTimeDifferenceInMinutes(matchTime, currentTime);
  
  return {
    datetime: timestampToDateTime(matchTime),
    date: timestampToDate(matchTime),
    time: timestampToTime(matchTime),
    iso: timestampToISO(matchTime),
    isLive: Math.abs(diffMinutes) <= 120, // Within 2 hours
    isPast: isInPast(matchTime),
    isFuture: isInFuture(matchTime),
    minutesFromNow: matchTime - currentTime > 0 ? Math.floor((matchTime - currentTime) / 60) : -Math.floor((currentTime - matchTime) / 60)
  };
};

module.exports = {
  timestampToDateTime,
  timestampToISO,
  timestampToDate,
  timestampToTime,
  getCurrentTimestamp,
  dateToTimestamp,
  isInPast,
  isInFuture,
  getTimeDifferenceInMinutes,
  formatMatchTime
};
