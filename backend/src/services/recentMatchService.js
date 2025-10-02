const Match = require('../models/match');
const Team = require('../models/team');
const { buildApiUrl, getRequestConfig, API_CONFIG } = require('../config/api');
const axios = require('axios');

/**
 * Recent Matches Synchronization Service
 * Implements TheSports API recent matches endpoint with full and incremental updates
 */
class RecentMatchService {
  
  constructor() {
    this.lastSyncTime = null;
    this.isInitialSync = true;
  }

  /**
   * Main sync function - handles both full and incremental updates
   * @param {Object} options - Sync options
   * @returns {Object} Sync result with count and type
   */
  async syncRecentMatches(options = {}) {
    try {
      console.log('🏃‍♂️ Starting recent matches synchronization...');
      
      // Check if this is first time sync (or force initial sync from options)
      const matchCount = await Match.countDocuments();
      const isFirstTime = matchCount === 0;
      
      let result;
      if (isFirstTime || this.isInitialSync || options.page) {
        console.log('🔄 Performing FULL update (first time sync)...');
        result = await this._performFullSync(options);
        // Reset the initial sync flag after successful full sync
        this.isInitialSync = false;
      } else {
        console.log('⚡ Performing INCREMENTAL update...');
        result = await this._performIncrementalSync(options);
      }
      
      console.log('✅ Recent matches synchronization completed');
      return result;
      
    } catch (error) {
      console.error('❌ Recent matches sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Perform full synchronization with pagination
   * Fetches all pages until no more data is available
   * @param {Object} options - Sync options
   */
  async _performFullSync(options = {}) {
    let page = 1;
    let totalProcessed = 0;
    let hasMorePages = true;
    
    console.log('📄 Starting full sync with pagination...');
    
    while (hasMorePages) {
      try {
        console.log(`📖 Fetching page ${page}...`);
        
        const params = {
          page: page,
          ...options
        };
        
        const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.MATCHES_RECENT, params);
        console.log(`📡 API Call: ${apiUrl}`);
        
        const response = await axios.get(apiUrl, getRequestConfig({
          timeout: 60000
        }));
        
        const data = response.data;
        
        // Check if API returned results (TheSports API returns code: 0 for success)
        if (Array.isArray(data.results)) {
          const matches = data.results;
          console.log(`📦 Processing ${matches.length} matches from page ${page}...`);
          
          if (matches.length > 0) {
            const processedCount = await this._processMatches(matches);
            totalProcessed += processedCount;
            
            // Move to next page
            page++;
            
            // Add delay to respect rate limits
            await this._delay(500);
          } else {
            // No matches on this page, stop pagination
            console.log(`🏁 No matches on page ${page}, ending pagination`);
            hasMorePages = false;
          }
          
        } else {
          // API returned invalid structure, stop pagination
          console.log(`⚠️ Invalid response on page ${page}:`, {
            code: data.code,
            hasResults: Array.isArray(data.results),
            resultsLength: data.results?.length || 0,
            responseKeys: Object.keys(data)
          });
          hasMorePages = false;
        }
        
      } catch (error) {
        console.error(`❌ Error fetching page ${page}:`, error.message);
        
        if (error.response?.status === 404 || error.response?.status === 400) {
          // Likely reached end of available pages
          console.log(`🏁 Reached end of available pages at page ${page}`);
          hasMorePages = false;
        } else {
          // Other errors - stop pagination to avoid infinite loops
          console.error(`❌ Stopping pagination due to error on page ${page}`);
          hasMorePages = false;
          
          // If no matches processed at all and it's the first page, re-throw error
          if (totalProcessed === 0 && page === 1) {
            throw error;
          }
        }
      }
    }
    
    // Update sync time
    this.lastSyncTime = Math.floor(Date.now() / 1000);
    console.log(`✅ Full sync completed. Processed ${totalProcessed} matches total across ${page - 1} pages.`);
    
    return {
      syncedCount: totalProcessed,
      pagesProcessed: page - 1,
      type: 'full'
    };
  }

  /**
   * Perform incremental synchronization (time-based)
   * @param {Object} options - Sync options  
   */
  async _performIncrementalSync(options = {}) {
    try {
      // Use last sync time or default to 1 hour ago
      const timeIncrement = this.lastSyncTime || (Math.floor(Date.now() / 1000) - 3600);
      
      console.log(`⏰ Fetching changes since timestamp: ${timeIncrement}`);
      
      const params = {
        time: timeIncrement,
        ...options
      };
      
      const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.MATCHES_RECENT, params);
      console.log(`📡 Incremental API Call: ${apiUrl}`);
      
      const response = await axios.get(apiUrl, getRequestConfig({
        timeout: 30000
      }));
      
      const data = response.data;
      
      if (Array.isArray(data.results)) {
        const matches = data.results;
        console.log(`📦 Processing ${matches.length} changed matches...`);
        
        const processedCount = await this._processMatches(matches);
        console.log(`✅ Incremental sync completed. Updated ${processedCount} matches.`);
        
        // Update sync time
        this.lastSyncTime = Math.floor(Date.now() / 1000);
        
        return {
          syncedCount: processedCount,
          type: 'incremental'
        };
        
      } else {
        console.log('ℹ️ No changed matches found in incremental sync');
        console.log('Response structure:', Object.keys(data));
        console.log('Response code:', data.code);
        console.log('Has results:', Array.isArray(data.results));
        if (data.results) {
          console.log('Results length:', data.results.length);
        }
        
        return {
          syncedCount: 0,
          type: 'incremental'
        };
      }
      
    } catch (error) {
      console.error('❌ Incremental sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Process array of matches and save to database
   * @param {Array} matches - Array of match data
   * @returns {number} Number of matches processed
   */
  async _processMatches(matches) {
    let processedCount = 0;
    
    for (const matchData of matches) {
      try {
        await this._saveMatch(matchData);
        processedCount++;
      } catch (error) {
        console.error(`❌ Error processing match ${matchData.id}:`, error.message);
        // Continue with other matches
      }
    }
    
    return processedCount;
  }

  /**
   * Save or update a single match in database
   * @param {Object} matchData - Match data from API
   */
  async _saveMatch(matchData) {
    try {
      const matchId = matchData.id;
      
      // Prepare match document - handle TheSports API field names
      const matchDoc = {
        match_id: matchId,
        season_id: matchData.season_id,
        comp_id: matchData.competition_id, // API uses competition_id, not comp_id
        stage_id: matchData.stage_id,
        group_id: matchData.group_id,
        home_team_id: matchData.home_team_id, // API uses direct team IDs
        away_team_id: matchData.away_team_id,
        home_scores: matchData.home_scores || [],
        away_scores: matchData.away_scores || [],
        status_id: matchData.status_id,
        match_datetime: matchData.match_time, // API uses match_time
        venue_id: matchData.venue_id,
        referee_id: matchData.referee_id,
        round: matchData.round,
        aggregate_home_score: matchData.aggregate_home_score,
        aggregate_away_score: matchData.aggregate_away_score,
        penalty_home_score: matchData.penalty_home_score,
        penalty_away_score: matchData.penalty_away_score,
        extra_time_home_score: matchData.extra_time_home_score,
        extra_time_away_score: matchData.extra_time_away_score,
        home_position: matchData.home_position,
        away_position: matchData.away_position,
        coverage: matchData.coverage,
        neutral: matchData.neutral,
        note: matchData.note,
        environment: matchData.environment,
        ended: matchData.ended,
        updated_at: matchData.updated_at || Math.floor(Date.now() / 1000)
      };
      
      // Upsert match (update if exists, create if not)
      await Match.findOneAndUpdate(
        { match_id: matchId },
        matchDoc,
        { upsert: true, new: true }
      );
      
      // Note: Recent matches API doesn't include team details
      // Team data should be synced separately via teams API
      
    } catch (error) {
      console.error(`❌ Error saving match ${matchData.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Save team data if it doesn't exist
   * @param {Object} teamData - Team data from match
   */
  async _saveTeamIfNotExists(teamData) {
    try {
      const existingTeam = await Team.findOne({ team_id: teamData.id });
      
      if (!existingTeam) {
        const teamDoc = {
          team_id: teamData.id,
          name: teamData.name,
          short_name: teamData.short_name,
          logo: teamData.logo,
          country_id: teamData.country_id,
          venue_id: teamData.venue_id,
          updated_at: Math.floor(Date.now() / 1000)
        };
        
        await Team.create(teamDoc);
        console.log(`➕ Created new team: ${teamData.name}`);
      }
    } catch (error) {
      console.error(`❌ Error saving team ${teamData.id}:`, error.message);
      // Don't throw - team saving is not critical
    }
  }

  /**
   * Utility function for delays
   * @param {number} ms - Milliseconds to delay
   */
  async _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get sync statistics
   * @returns {Object} Sync statistics
   */
  async getSyncStats() {
    try {
      const totalMatches = await Match.countDocuments();
      const recentMatches = await Match.countDocuments({
        updated_at: { $gte: Math.floor(Date.now() / 1000) - 86400 } // Last 24 hours
      });
      
      return {
        total_matches: totalMatches,
        recent_updates: recentMatches,
        last_sync_time: this.lastSyncTime,
        is_initial_sync: this.isInitialSync
      };
    } catch (error) {
      console.error('❌ Error getting sync stats:', error.message);
      return null;
    }
  }
}

module.exports = RecentMatchService;