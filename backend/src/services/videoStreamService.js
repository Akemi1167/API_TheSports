const VideoStream = require('../models/videoStream');
const { 
  timestampToDateTime, 
  timestampToDate, 
  timestampToTime, 
  formatMatchTime,
  getCurrentTimestamp 
} = require('../utils/timestampUtils');

class VideoStreamService {
  async getAllVideoStreams() {
    try {
      const videoStreams = await VideoStream.find().sort({ match_time: -1 });
      
      // Add formatted datetime to each stream
      const streamsWithDateTime = videoStreams.map(stream => {
        const streamObj = stream.toObject();
        const matchTimeInfo = formatMatchTime(stream.match_time);
        
        return {
          ...streamObj,
          match_datetime: matchTimeInfo.datetime,
          match_date: matchTimeInfo.date,
          match_time_only: matchTimeInfo.time,
          is_live: matchTimeInfo.isLive,
          is_past: matchTimeInfo.isPast,
          is_future: matchTimeInfo.isFuture,
          minutes_from_now: matchTimeInfo.minutesFromNow
        };
      });
      
      return {
        success: true,
        data: streamsWithDateTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getVideoStreamByMatchId(match_id) {
    try {
      const videoStream = await VideoStream.findOne({ match_id });
      if (!videoStream) {
        return {
          success: false,
          error: 'Video stream not found',
          statusCode: 404
        };
      }
      
      // Add formatted datetime
      const streamObj = videoStream.toObject();
      const matchTimeInfo = formatMatchTime(videoStream.match_time);
      
      const streamWithDateTime = {
        ...streamObj,
        match_datetime: matchTimeInfo.datetime,
        match_date: matchTimeInfo.date,
        match_time_only: matchTimeInfo.time,
        is_live: matchTimeInfo.isLive,
        is_past: matchTimeInfo.isPast,
        is_future: matchTimeInfo.isFuture,
        minutes_from_now: matchTimeInfo.minutesFromNow
      };
      
      return {
        success: true,
        data: streamWithDateTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getVideoStreamsBySportId(sport_id) {
    try {
      const videoStreams = await VideoStream.find({ sport_id }).sort({ match_time: -1 });
      
      // Add formatted datetime to each stream
      const streamsWithDateTime = videoStreams.map(stream => {
        const streamObj = stream.toObject();
        const matchTimeInfo = formatMatchTime(stream.match_time);
        
        return {
          ...streamObj,
          match_datetime: matchTimeInfo.datetime,
          match_date: matchTimeInfo.date,
          match_time_only: matchTimeInfo.time,
          is_live: matchTimeInfo.isLive,
          is_past: matchTimeInfo.isPast,
          is_future: matchTimeInfo.isFuture,
          minutes_from_now: matchTimeInfo.minutesFromNow
        };
      });
      
      return {
        success: true,
        data: streamsWithDateTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getActiveStreams() {
    try {
      // Get streams for matches happening today or in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Math.floor(today.getTime() / 1000);
      
      const activeStreams = await VideoStream.find({ 
        match_time: { $gte: todayTimestamp }
      }).sort({ match_time: 1 });
      
      // Add formatted datetime to each active stream
      const activeWithDateTime = activeStreams.map(stream => {
        const streamObj = stream.toObject();
        const matchTimeInfo = formatMatchTime(stream.match_time);
        
        return {
          ...streamObj,
          match_datetime: matchTimeInfo.datetime,
          match_date: matchTimeInfo.date,
          match_time_only: matchTimeInfo.time,
          is_live: matchTimeInfo.isLive,
          is_past: matchTimeInfo.isPast,
          is_future: matchTimeInfo.isFuture,
          minutes_from_now: matchTimeInfo.minutesFromNow
        };
      });
      
      return {
        success: true,
        data: activeWithDateTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUpcomingMatches(hoursAhead = 24) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const futureTime = now + (hoursAhead * 60 * 60); // Convert hours to seconds
      
      const upcomingMatches = await VideoStream.find({
        match_time: { 
          $gte: now,
          $lte: futureTime
        }
      }).sort({ match_time: 1 });
      
      // Add formatted datetime to each upcoming match
      const upcomingWithDateTime = upcomingMatches.map(match => {
        const matchObj = match.toObject();
        const matchTimeInfo = formatMatchTime(match.match_time);
        
        return {
          ...matchObj,
          match_datetime: matchTimeInfo.datetime,
          match_date: matchTimeInfo.date,
          match_time_only: matchTimeInfo.time,
          is_live: matchTimeInfo.isLive,
          is_past: matchTimeInfo.isPast,
          is_future: matchTimeInfo.isFuture,
          minutes_from_now: matchTimeInfo.minutesFromNow,
          hours_from_now: Math.round(matchTimeInfo.minutesFromNow / 60 * 10) / 10 // Round to 1 decimal
        };
      });
      
      return {
        success: true,
        data: upcomingWithDateTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getLiveMatches() {
    try {
      const now = Math.floor(Date.now() / 1000);
      const twoHoursAgo = now - (2 * 60 * 60); // 2 hours ago
      const oneHourFromNow = now + (1 * 60 * 60); // 1 hour from now
      
      // Matches that started within the last 2 hours and should be ongoing
      const liveMatches = await VideoStream.find({
        match_time: {
          $gte: twoHoursAgo,
          $lte: oneHourFromNow
        }
      }).sort({ match_time: 1 });
      
      // Add match time information to live matches with datetime conversion
      const liveMatchesWithTime = liveMatches.map(match => {
        const matchObj = match.toObject();
        const matchTimeInfo = this.calculateMatchMinutes(now, match.match_time);
        const datetimeInfo = formatMatchTime(match.match_time);
        
        return {
          ...matchObj,
          // Datetime conversion fields
          match_datetime: datetimeInfo.datetime,
          match_date: datetimeInfo.date,
          match_time_only: datetimeInfo.time,
          is_live: datetimeInfo.isLive,
          is_past: datetimeInfo.isPast,
          is_future: datetimeInfo.isFuture,
          minutes_from_now: datetimeInfo.minutesFromNow,
          // Match timing fields
          matchTimeInfo
        };
      }).filter(match => match.matchTimeInfo.isLive || match.matchTimeInfo.half === 'half-time');
      
      return {
        success: true,
        data: liveMatchesWithTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get detailed match timing information for a specific match
   * @param {string} match_id - Match ID
   * @param {number} secondHalfKickoff - Optional second half kickoff timestamp
   * @returns {object} Detailed match timing information
   */
  async getMatchTiming(match_id, secondHalfKickoff = null) {
    try {
      const match = await VideoStream.findOne({ match_id });
      if (!match) {
        return {
          success: false,
          error: 'Match not found',
          statusCode: 404
        };
      }
      
      const now = Math.floor(Date.now() / 1000);
      const matchTimeInfo = this.calculateMatchMinutes(now, match.match_time, secondHalfKickoff);
      
      return {
        success: true,
        data: {
          match_id: match.match_id,
          sport_id: match.sport_id,
          kickoffTime: match.match_time,
          kickoffTimeFormatted: new Date(match.match_time * 1000).toISOString(),
          currentTime: now,
          currentTimeFormatted: new Date(now * 1000).toISOString(),
          ...matchTimeInfo
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getMatchesByTimeRange(startTime, endTime) {
    try {
      const matches = await VideoStream.find({
        match_time: {
          $gte: startTime,
          $lte: endTime
        }
      }).sort({ match_time: 1 });
      
      // Add formatted datetime to each match
      const matchesWithDateTime = matches.map(match => {
        const matchObj = match.toObject();
        const matchTimeInfo = formatMatchTime(match.match_time);
        
        return {
          ...matchObj,
          match_datetime: matchTimeInfo.datetime,
          match_date: matchTimeInfo.date,
          match_time_only: matchTimeInfo.time,
          is_live: matchTimeInfo.isLive,
          is_past: matchTimeInfo.isPast,
          is_future: matchTimeInfo.isFuture,
          minutes_from_now: matchTimeInfo.minutesFromNow
        };
      });
      
      return {
        success: true,
        data: matchesWithDateTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate match minutes based on current timestamp and match start time
   * @param {number} currentTimestamp - Current timestamp in seconds
   * @param {number} firstHalfKickoff - First half kickoff timestamp in seconds  
   * @param {number} secondHalfKickoff - Second half kickoff timestamp in seconds (optional)
   * @returns {object} Match time information
   */
  calculateMatchMinutes(currentTimestamp, firstHalfKickoff, secondHalfKickoff = null) {
    const timeSinceFirstHalf = currentTimestamp - firstHalfKickoff;
    
    // If match hasn't started
    if (timeSinceFirstHalf < 0) {
      return {
        matchMinutes: 0,
        half: 'pre-match',
        displayTime: '0\'',
        isLive: false
      };
    }
    
    // First half: match minutes = (current timestamp - first half kick-off timestamp) / 60 + 1
    const firstHalfMinutes = Math.floor(timeSinceFirstHalf / 60) + 1;
    
    // If we don't have second half kickoff time, assume standard 45+15 min break
    if (!secondHalfKickoff) {
      // Assume 45 min first half + 15 min break = 3600 seconds
      const standardSecondHalfStart = firstHalfKickoff + (45 * 60) + (15 * 60);
      secondHalfKickoff = standardSecondHalfStart;
    }
    
    const timeSinceSecondHalf = currentTimestamp - secondHalfKickoff;
    
    // Still in first half (0-45 minutes)
    if (firstHalfMinutes <= 45 && timeSinceSecondHalf < 0) {
      return {
        matchMinutes: firstHalfMinutes,
        half: 'first-half',
        displayTime: `${firstHalfMinutes}'`,
        isLive: true,
        timeInHalf: firstHalfMinutes
      };
    }
    
    // Half-time break
    if (timeSinceSecondHalf < 0) {
      return {
        matchMinutes: 45,
        half: 'half-time',
        displayTime: 'HT',
        isLive: false,
        timeInHalf: 45
      };
    }
    
    // Second half: match minutes = (current timestamp - second half kick-off timestamp) / 60 + 45 + 1
    const secondHalfMinutes = Math.floor(timeSinceSecondHalf / 60) + 45 + 1;
    
    // Second half (46-90+ minutes)
    if (secondHalfMinutes <= 100) { // Allow for extra time up to 100 minutes total
      return {
        matchMinutes: secondHalfMinutes,
        half: 'second-half',
        displayTime: `${secondHalfMinutes}'`,
        isLive: true,
        timeInHalf: secondHalfMinutes - 45
      };
    }
    
    // Match finished (over 100 minutes)
    return {
      matchMinutes: secondHalfMinutes,
      half: 'finished',
      displayTime: 'FT',
      isLive: false,
      timeInHalf: secondHalfMinutes - 45
    };
  }

  async getMatchesWithStatus() {
    try {
      const now = Math.floor(Date.now() / 1000);
      const twoHoursAgo = now - (2 * 60 * 60);
      const twentyFourHoursFromNow = now + (24 * 60 * 60);
      
      const matches = await VideoStream.find({
        match_time: {
          $gte: twoHoursAgo,
          $lte: twentyFourHoursFromNow
        }
      }).sort({ match_time: 1 });
      
      // Add status and datetime to each match
      const matchesWithStatus = matches.map(match => {
        const matchObj = match.toObject();
        const matchTime = match.match_time;
        const matchTimeInfo = formatMatchTime(matchTime);
        
        let status = 'upcoming';
        let timeUntilMatch = null;
        let timeFromStart = null;
        let matchTimingInfo = null;
        
        if (matchTime <= now) {
          const timeSinceStart = now - matchTime;
          timeFromStart = timeSinceStart;
          
          // Calculate match minutes using the new formula
          matchTimingInfo = this.calculateMatchMinutes(now, matchTime);
          
          // Determine status based on match time info
          if (matchTimingInfo.isLive || matchTimingInfo.half === 'half-time') {
            status = 'live';
          } else if (matchTimingInfo.half === 'finished') {
            status = 'finished';
          } else if (timeSinceStart <= 7200) { // Fallback: 2 hours = 7200 seconds
            status = 'live';
          } else {
            status = 'finished';
          }
        } else {
          timeUntilMatch = matchTime - now;
          status = 'upcoming';
          matchTimingInfo = this.calculateMatchMinutes(now, matchTime);
        }
        
        return {
          ...matchObj,
          // Status fields
          status,
          timeUntilMatch,
          timeFromStart,
          matchTimeFormatted: new Date(matchTime * 1000).toISOString(),
          matchTimeInfo: matchTimingInfo,
          // Datetime conversion fields
          match_datetime: matchTimeInfo.datetime,
          match_date: matchTimeInfo.date,
          match_time_only: matchTimeInfo.time,
          is_live: matchTimeInfo.isLive,
          is_past: matchTimeInfo.isPast,
          is_future: matchTimeInfo.isFuture,
          minutes_from_now: matchTimeInfo.minutesFromNow
        };
      });
      
      return {
        success: true,
        data: matchesWithStatus
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new VideoStreamService();
