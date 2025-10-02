const Match = require('../models/match');
const { buildApiUrl, getRequestConfig, API_CONFIG } = require('../config/api');
const axios = require('axios');

class MatchService {
  
  /**
   * Sync matches from TheSports API
   * @param {Object} options - Sync options
   * @param {string} options.seasonId - Season ID to sync
   * @param {string} options.compId - Competition ID to sync  
   * @param {number} options.limit - Limit number of matches to sync
   */
  async syncMatchesFromAPI(options = {}) {
    try {
      console.log('🏃‍♂️ Starting matches synchronization from API...');
      
      const { seasonId, compId, limit } = options;
      
      // Build API parameters
      const params = {};
      if (seasonId) params.season_id = seasonId;
      if (compId) params.comp_id = compId;
      if (limit) params.limit = limit;
      
      // Try recent matches first, then fall back to regular matches
      let apiUrl, endpoint;
      
      try {
      // Try recent matches API first (note: don't use UUID parameter)
      endpoint = API_CONFIG.ENDPOINTS.MATCHES_RECENT;
      apiUrl = buildApiUrl(endpoint, params);
      console.log(`📡 Calling Recent Matches API: ${apiUrl}`);
      
      const response = await axios.get(apiUrl, getRequestConfig({
        timeout: 60000 // 60 seconds for large datasets
      }));        await this._processMatchesResponse(response.data, 'recent');
        
      } catch (recentError) {
        console.log('ℹ️ Recent matches API failed, trying regular matches API...');
        
        // Fall back to regular matches API
        endpoint = API_CONFIG.ENDPOINTS.MATCHES;
        apiUrl = buildApiUrl(endpoint, params);
        console.log(`📡 Calling Matches API: ${apiUrl}`);
        
        const response = await axios.get(apiUrl, getRequestConfig({
          timeout: 60000
        }));
        
        await this._processMatchesResponse(response.data, 'regular');
      }
      
      console.log('✅ Matches synchronization completed successfully');
      
    } catch (error) {
      console.error('❌ Matches synchronization failed:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }
  
  /**
   * Process API response and save matches to database
   * @private
   */
  async _processMatchesResponse(responseData, source = 'unknown') {
    const matches = responseData.results || responseData.data || [];
    console.log(`📊 Processing ${matches.length} matches from ${source} API...`);
    
    let insertCount = 0;
    let updateCount = 0;
    let skipCount = 0;
    
    for (const matchData of matches) {
      try {
        if (!matchData.id && !matchData.match_id) {
          console.log('⚠️ Skipping match without ID:', matchData);
          skipCount++;
          continue;
        }
        
        const processedMatch = this._processMatchData(matchData);
        
        // Use upsert to create or update
        const result = await Match.findOneAndUpdate(
          { match_id: processedMatch.match_id },
          processedMatch,
          { 
            upsert: true, 
            new: true,
            runValidators: true 
          }
        );
        
        if (result.isNew) {
          insertCount++;
        } else {
          updateCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error processing match ${matchData.match_id}:`, error.message);
        skipCount++;
      }
    }
    
    console.log(`✅ Matches processing completed:`);
    console.log(`   - Inserted: ${insertCount}`);
    console.log(`   - Updated: ${updateCount}`);
    console.log(`   - Skipped: ${skipCount}`);
  }
  
  /**
   * Process and normalize match data from new API structure
   * @private
   */
  _processMatchData(apiData) {
    return {
      // Match identification
      match_id: apiData.id || apiData.match_id,
      
      // Competition and season
      season_id: apiData.season_id || '',
      competition_id: apiData.competition_id || '',
      
      // Teams
      home_team_id: apiData.home_team_id || '',
      away_team_id: apiData.away_team_id || '',
      
      // Timing
      match_time: apiData.match_time || 0,
      
      // Status
      status_id: apiData.status_id || 0,
      
      // Officials and venue
      venue_id: apiData.venue_id || '',
      referee_id: apiData.referee_id || '',
      
      // Match properties
      neutral: apiData.neutral || 0,
      note: apiData.note || '',
      
      // Scores arrays
      home_scores: Array.isArray(apiData.home_scores) ? apiData.home_scores : [],
      away_scores: Array.isArray(apiData.away_scores) ? apiData.away_scores : [],
      
      // Team positions
      home_position: apiData.home_position || '',
      away_position: apiData.away_position || '',
      
      // Coverage
      coverage: {
        mlive: apiData.coverage?.mlive || 0,
        lineup: apiData.coverage?.lineup || 0
      },
      
      // Round information
      round: {
        stage_id: apiData.round?.stage_id || '',
        group_num: apiData.round?.group_num || null,
        round_num: apiData.round?.round_num || null
      },
      
      // Double round data
      related_id: apiData.related_id || '',
      agg_score: Array.isArray(apiData.agg_score) ? apiData.agg_score : [],
      
      // Environment (optional)
      environment: apiData.environment ? {
        weather: apiData.environment.weather || null,
        pressure: apiData.environment.pressure || '',
        temperature: apiData.environment.temperature || '',
        wind: apiData.environment.wind || '',
        humidity: apiData.environment.humidity || ''
      } : {},
      
      // Match flags
      tbd: apiData.tbd || 0,
      has_ot: apiData.has_ot || 0,
      ended: apiData.ended || null,
      team_reverse: apiData.team_reverse || 0,
      
      // API timestamp
      updated_at: apiData.updated_at || Math.floor(Date.now() / 1000)
    };
  }
  
  /**
   * Parse score value safely
   * @private
   */
  _parseScore(score) {
    if (score === null || score === undefined || score === '') {
      return null;
    }
    const parsed = parseInt(score);
    return isNaN(parsed) ? null : parsed;
  }
  
  /**
   * Get status name from status code
   * @private
   */
  _getStatusName(status) {
    const statusMap = {
      0: 'Scheduled',
      1: 'Live',
      2: 'Half Time', 
      3: 'Finished',
      4: 'Postponed',
      5: 'Cancelled',
      6: 'Abandoned',
      7: 'Interrupted',
      8: 'Suspended'
    };
    
    return statusMap[status] || 'Unknown';
  }
  
  /**
   * Get team's recent matches for Last 5 form
   */
  async getTeamRecentMatches(teamId, options = {}) {
    try {
      const {
        limit = 5,
        seasonId = null,
        compId = null,
        onlyFinished = true,
        status = null
      } = options;
      
      const query = {
        $or: [
          { home_team_id: teamId },
          { away_team_id: teamId }
        ]
      };
      
      // Status filter - if specific status provided, use it; otherwise use onlyFinished logic
      if (status !== null) {
        query.status_id = status;
      } else if (onlyFinished) {
        query.status_id = 8; // Status 8 = finished matches from API
      }
      
      // Add optional filters
      if (seasonId) {
        query.season_id = seasonId;
      }
      
      if (compId) {
        query.competition_id = compId;
      }
      
      const matches = await Match.find(query)
        .sort({ match_time: -1 })
        .limit(limit)
        .lean();
      
      return {
        success: true,
        data: matches
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get matches by competition and season
   */
  async getMatchesByCompetition(compId, seasonId = null, options = {}) {
    try {
      const {
        limit = 100,
        status = null,
        sortBy = 'match_time',
        sortOrder = -1
      } = options;
      
      const query = { competition_id: compId };
      
      if (seasonId) {
        query.season_id = seasonId;
      }
      
      if (status !== null) {
        query.status_id = status;
      }
      
      const matches = await Match.find(query)
        .sort({ [sortBy]: sortOrder })
        .limit(limit)
        .lean();
      
      return {
        success: true,
        data: matches
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get match statistics
   */
  async getMatchStats() {
    try {
      const stats = await Match.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            finished: { 
              $sum: { $cond: [{ $eq: ['$status_id', 8] }, 1, 0] } 
            },
            live: { 
              $sum: { $cond: [{ $eq: ['$status_id', 1] }, 1, 0] } 
            },
            scheduled: { 
              $sum: { $cond: [{ $eq: ['$status_id', 0] }, 1, 0] } 
            }
          }
        }
      ]);
      
      return {
        success: true,
        data: stats[0] || {
          total: 0,
          finished: 0,
          live: 0,
          scheduled: 0
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new MatchService();