const Match = require('../models/match');
const Team = require('../models/team');
const { buildApiUrl, getRequestConfig, API_CONFIG } = require('../config/api');
const axios = require('axios');

/**
 * Season Matches Service
 * Handles season-specific match operations using TheSports API
 */
class SeasonMatchService {

  /**
   * Sync matches for a specific season from TheSports API
   * @param {string} seasonId - Season UUID
   * @param {object} options - Additional options
   */
  async syncSeasonMatches(seasonId, options = {}) {
    try {
      console.log(`⚽ Starting season matches sync for: ${seasonId}`);
      
      const params = {
        uuid: seasonId,
        ...options
      };
      
      const apiUrl = buildApiUrl(API_CONFIG.ENDPOINTS.MATCHES_SEASON_RECENT, params);
      console.log(`📡 API Call: ${apiUrl}`);
      
      const response = await axios.get(apiUrl, getRequestConfig({
        timeout: 60000
      }));
      
      const data = response.data;
      
      if (Array.isArray(data.results)) {
        const matches = data.results;
        console.log(`📦 Processing ${matches.length} matches from season ${seasonId}...`);
        
        let processedCount = 0;
        
        for (const matchData of matches) {
          try {
            await this._saveMatch(matchData);
            processedCount++;
          } catch (error) {
            console.error(`❌ Error processing match ${matchData.id}:`, error.message);
          }
        }
        
        console.log(`✅ Season matches sync completed: ${processedCount} matches processed`);
        
        return {
          success: true,
          syncedCount: processedCount,
          seasonId: seasonId
        };
        
      } else {
        console.log(`⚠️ Invalid response for season ${seasonId}:`, {
          code: data.code,
          hasResults: Array.isArray(data.results),
          resultsLength: data.results?.length || 0
        });
        
        return {
          success: false,
          error: 'Invalid API response structure',
          seasonId: seasonId
        };
      }
      
    } catch (error) {
      console.error(`❌ Season matches sync failed for ${seasonId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get Last 5 matches for a team in a specific season using real match data
   * @param {string} teamId - Team ID
   * @param {string} seasonId - Season ID
   * @param {string} compId - Competition ID (optional)
   * @returns {object} - Last 5 matches with real data
   */
  async getTeamLast5WithRealData(teamId, seasonId, compId = null) {
    try {
      console.log(`🏃 Getting real Last 5 data for team ${teamId} in season ${seasonId}`);
      
      // Tạo query để tìm matches của đội trong season
      let matchQuery = {
        $or: [
          { home_team_id: teamId },
          { away_team_id: teamId }
        ],
        season_id: seasonId,
        status_id: 3 // Finished matches only (status_id 3 = completed)
      };

      // Thêm filter theo competition nếu có
      if (compId) {
        matchQuery.comp_id = compId;
      }

      // Lấy matches, sắp xếp theo thời gian giảm dần
      const matches = await Match.find(matchQuery)
        .sort({ match_datetime: -1 })
        .limit(5)
        .lean();

      if (!matches || matches.length === 0) {
        // Nếu không có matches thực, sync từ API trước
        console.log(`📡 No matches found, syncing from API for season ${seasonId}`);
        await this.syncSeasonMatches(seasonId);
        
        // Thử lại sau khi sync
        const retryMatches = await Match.find(matchQuery)
          .sort({ match_datetime: -1 })
          .limit(5)
          .lean();
          
        if (!retryMatches || retryMatches.length === 0) {
          return {
            success: false,
            error: 'No completed matches found for this team in season',
            statusCode: 404
          };
        }
        
        return this._processMatches(retryMatches, teamId);
      }

      return this._processMatches(matches, teamId);
      
    } catch (error) {
      console.error('❌ Error getting team Last 5 with real data:', error);
      return {
        success: false,
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Process matches and create Last 5 format
   * @private
   */
  async _processMatches(matches, teamId) {
    const processedMatches = [];
    let formString = '';

    // Lấy thông tin teams để có tên đối thủ
    const teamIds = new Set();
    matches.forEach(match => {
      teamIds.add(match.home_team_id);
      teamIds.add(match.away_team_id);
    });

    const teams = await Team.find({ 
      team_id: { $in: Array.from(teamIds) } 
    }).lean();
    
    const teamMap = teams.reduce((map, team) => {
      map[team.team_id] = team;
      return map;
    }, {});

    matches.forEach(match => {
      const matchResult = this._getMatchResult(match, teamId, teamMap);
      if (matchResult) {
        processedMatches.push(matchResult);
        formString += matchResult.result;
      }
    });

    return {
      success: true,
      data: {
        last5_form: formString,
        matches: processedMatches
      }
    };
  }

  /**
   * Get match result for a team
   * @private
   */
  _getMatchResult(match, teamId, teamMap = {}) {
    // Chỉ tính các trận đã kết thúc
    if (match.status_id !== 8) {
      return null;
    }

    // Get scores from arrays
    const homeScore = match.home_scores && match.home_scores[0] !== undefined ? match.home_scores[0] : null;
    const awayScore = match.away_scores && match.away_scores[0] !== undefined ? match.away_scores[0] : null;

    if (homeScore === null || awayScore === null) {
      return null;
    }

    const isHome = match.home_team_id === teamId;
    const isAway = match.away_team_id === teamId;

    if (!isHome && !isAway) {
      return null;
    }

    let result;
    if (homeScore > awayScore) {
      result = isHome ? 'W' : 'L';
    } else if (homeScore < awayScore) {
      result = isHome ? 'L' : 'W';
    } else {
      result = 'D';
    }

    // Determine opponent
    const opponentTeamId = isHome ? match.away_team_id : match.home_team_id;
    const opponentTeam = teamMap[opponentTeamId];
    const opponentName = opponentTeam?.name || opponentTeam?.short_name || `Team ${opponentTeamId}`;

    return {
      match_id: match.match_id,
      match_time: match.match_datetime,
      match_datetime: match.match_datetime,
      home_team: {
        id: match.home_team_id,
        name: teamMap[match.home_team_id]?.name || `Team ${match.home_team_id}`
      },
      away_team: {
        id: match.away_team_id,
        name: teamMap[match.away_team_id]?.name || `Team ${match.away_team_id}`
      },
      score: {
        home: homeScore,
        away: awayScore
      },
      result: result,
      venue: isHome ? 'home' : 'away',
      opponent: opponentName,
      competition: match.comp_id || 'Unknown'
    };
  }

  /**
   * Save match to database
   * @private
   */
  async _saveMatch(matchData) {
    try {
      const matchId = matchData.id;
      
      const matchDoc = {
        match_id: matchId,
        season_id: matchData.season_id,
        comp_id: matchData.competition_id,
        stage_id: matchData.stage_id,
        group_id: matchData.group_id,
        home_team_id: matchData.home_team_id,
        away_team_id: matchData.away_team_id,
        home_scores: matchData.home_scores || [],
        away_scores: matchData.away_scores || [],
        status_id: matchData.status_id,
        match_datetime: matchData.match_time,
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
      
      await Match.findOneAndUpdate(
        { match_id: matchId },
        matchDoc,
        { upsert: true, new: true }
      );
      
    } catch (error) {
      console.error(`❌ Error saving match ${matchData.id}:`, error.message);
      throw error;
    }
  }
}

module.exports = new SeasonMatchService();