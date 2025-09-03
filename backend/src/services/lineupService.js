const Lineup = require('../models/lineup');
const axios = require('axios');

class LineupService {
  /**
   * Lấy lineup theo match ID
   * @param {string} matchId - Match ID
   * @returns {Object} Lineup data
   */
  async getLineupByMatchId(matchId) {
    try {
      const lineup = await Lineup.findByMatchId(matchId);
      
      if (!lineup) {
        return {
          success: false,
          error: 'Lineup not found for this match',
          statusCode: 404
        };
      }

      return {
        success: true,
        data: lineup
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy starting eleven của trận đấu
   * @param {string} matchId - Match ID
   * @param {string} team - 'home', 'away', or 'both'
   * @returns {Object} Starting eleven data
   */
  async getStartingEleven(matchId, team = 'both') {
    try {
      const lineup = await Lineup.findByMatchId(matchId);
      
      if (!lineup) {
        return {
          success: false,
          error: 'Lineup not found for this match',
          statusCode: 404
        };
      }

      const startingEleven = lineup.getStartingEleven(team);

      return {
        success: true,
        data: {
          match_id: matchId,
          confirmed: lineup.confirmed,
          formation: {
            home: lineup.home_formation,
            away: lineup.away_formation
          },
          starting_eleven: startingEleven
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy substitutes của trận đấu
   * @param {string} matchId - Match ID
   * @param {string} team - 'home', 'away', or 'both'
   * @returns {Object} Substitutes data
   */
  async getSubstitutes(matchId, team = 'both') {
    try {
      const lineup = await Lineup.findByMatchId(matchId);
      
      if (!lineup) {
        return {
          success: false,
          error: 'Lineup not found for this match',
          statusCode: 404
        };
      }

      const substitutes = lineup.getSubstitutes(team);

      return {
        success: true,
        data: {
          match_id: matchId,
          substitutes: substitutes
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy thông tin cầu thủ trong lineup
   * @param {string} matchId - Match ID
   * @param {string} playerId - Player ID
   * @returns {Object} Player lineup data
   */
  async getPlayerInLineup(matchId, playerId) {
    try {
      const lineup = await Lineup.findByMatchId(matchId);
      
      if (!lineup) {
        return {
          success: false,
          error: 'Lineup not found for this match',
          statusCode: 404
        };
      }

      const { player, team } = lineup.getPlayerStats(playerId);
      
      if (!player) {
        return {
          success: false,
          error: 'Player not found in this match lineup',
          statusCode: 404
        };
      }

      return {
        success: true,
        data: {
          match_id: matchId,
          team: team,
          player: player
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy tất cả incidents của trận đấu
   * @param {string} matchId - Match ID
   * @returns {Object} All incidents data
   */
  async getMatchIncidents(matchId) {
    try {
      const lineup = await Lineup.findByMatchId(matchId);
      
      if (!lineup) {
        return {
          success: false,
          error: 'Lineup not found for this match',
          statusCode: 404
        };
      }

      const incidents = lineup.getAllIncidents();

      return {
        success: true,
        data: {
          match_id: matchId,
          total_incidents: incidents.length,
          incidents: incidents
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy incidents của một cầu thủ
   * @param {string} matchId - Match ID
   * @param {string} playerId - Player ID
   * @returns {Object} Player incidents data
   */
  async getPlayerIncidents(matchId, playerId) {
    try {
      const lineup = await Lineup.findByMatchId(matchId);
      
      if (!lineup) {
        return {
          success: false,
          error: 'Lineup not found for this match',
          statusCode: 404
        };
      }

      const incidents = lineup.getPlayerIncidents(playerId);
      const { player, team } = lineup.getPlayerStats(playerId);

      if (!player) {
        return {
          success: false,
          error: 'Player not found in this match lineup',
          statusCode: 404
        };
      }

      return {
        success: true,
        data: {
          match_id: matchId,
          player_id: playerId,
          player_name: player.name,
          team: team,
          total_incidents: incidents.length,
          incidents: incidents
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy injury data của trận đấu
   * @param {string} matchId - Match ID
   * @returns {Object} Injury data
   */
  async getInjuryData(matchId) {
    try {
      const lineup = await Lineup.findByMatchId(matchId);
      
      if (!lineup) {
        return {
          success: false,
          error: 'Lineup not found for this match',
          statusCode: 404
        };
      }

      return {
        success: true,
        data: {
          match_id: matchId,
          injury: lineup.injury
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy captain của các đội
   * @param {string} matchId - Match ID
   * @returns {Object} Captains data
   */
  async getCaptains(matchId) {
    try {
      const lineup = await Lineup.findByMatchId(matchId);
      
      if (!lineup) {
        return {
          success: false,
          error: 'Lineup not found for this match',
          statusCode: 404
        };
      }

      const captains = lineup.getCaptains();

      return {
        success: true,
        data: {
          match_id: matchId,
          captains: captains
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy lineup theo coach ID
   * @param {string} coachId - Coach ID
   * @returns {Object} Lineup data
   */
  async getLineupsByCoach(coachId) {
    try {
      const lineups = await Lineup.findByCoachId(coachId);

      return {
        success: true,
        data: lineups
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy lineup theo player ID
   * @param {string} playerId - Player ID
   * @returns {Object} Lineup data
   */
  async getLineupsByPlayer(playerId) {
    try {
      const lineups = await Lineup.findByPlayerId(playerId);

      return {
        success: true,
        data: lineups
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Tạo hoặc cập nhật lineup data
   * @param {Object} lineupData - Lineup data
   * @returns {Object} Create/update result
   */
  async createOrUpdateLineup(lineupData) {
    try {
      const { match_id } = lineupData;
      
      const existingLineup = await Lineup.findByMatchId(match_id);
      
      if (existingLineup) {
        // Update existing lineup
        Object.assign(existingLineup, lineupData);
        existingLineup.last_updated = Math.floor(Date.now() / 1000);
        
        await existingLineup.save();
        
        return {
          success: true,
          action: 'updated',
          data: existingLineup
        };
      } else {
        // Create new lineup
        const newLineup = new Lineup(lineupData);
        await newLineup.save();
        
        return {
          success: true,
          action: 'created',
          data: newLineup
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Xóa lineup data
   * @param {string} matchId - Match ID
   * @returns {Object} Delete result
   */
  async deleteLineup(matchId) {
    try {
      const result = await Lineup.deleteOne({ match_id: matchId });
      
      if (result.deletedCount === 0) {
        return {
          success: false,
          error: 'Lineup not found',
          statusCode: 404
        };
      }

      return {
        success: true,
        data: { message: 'Lineup deleted successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy formation analysis
   * @param {string} matchId - Match ID
   * @returns {Object} Formation analysis
   */
  async getFormationAnalysis(matchId) {
    try {
      const lineup = await Lineup.findByMatchId(matchId);
      
      if (!lineup) {
        return {
          success: false,
          error: 'Lineup not found for this match',
          statusCode: 404
        };
      }

      const analysis = {
        home: {
          formation: lineup.home_formation,
          players_by_position: {},
          starting_eleven_count: 0,
          substitutes_count: 0
        },
        away: {
          formation: lineup.away_formation,
          players_by_position: {},
          starting_eleven_count: 0,
          substitutes_count: 0
        }
      };

      // Analyze home team
      lineup.lineup.home.forEach(player => {
        if (!analysis.home.players_by_position[player.position]) {
          analysis.home.players_by_position[player.position] = 0;
        }
        analysis.home.players_by_position[player.position]++;
        
        if (player.first === 1) {
          analysis.home.starting_eleven_count++;
        } else {
          analysis.home.substitutes_count++;
        }
      });

      // Analyze away team
      lineup.lineup.away.forEach(player => {
        if (!analysis.away.players_by_position[player.position]) {
          analysis.away.players_by_position[player.position] = 0;
        }
        analysis.away.players_by_position[player.position]++;
        
        if (player.first === 1) {
          analysis.away.starting_eleven_count++;
        } else {
          analysis.away.substitutes_count++;
        }
      });

      return {
        success: true,
        data: {
          match_id: matchId,
          analysis: analysis
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sync lineup data for multiple matches
   * @param {Array} matchIds - Array of match IDs
   * @returns {Object} Sync results
   */
  async syncLineupsBatch(matchIds) {
    try {
      if (!Array.isArray(matchIds) || matchIds.length === 0) {
        return {
          success: false,
          error: 'Invalid or empty match IDs array'
        };
      }

      const results = {
        processed: 0,
        created: 0,
        updated: 0,
        errors: 0,
        errorDetails: []
      };

      console.log(`🔄 Processing ${matchIds.length} matches for lineup sync...`);

      for (const matchId of matchIds) {
        try {
          results.processed++;
          console.log(`📋 Processing lineup for match: ${matchId} (${results.processed}/${matchIds.length})`);

          const syncResult = await this.syncLineupForMatch(matchId);
          
          if (syncResult.success) {
            if (syncResult.data.isNew) {
              results.created++;
              console.log(`✅ Created new lineup for match: ${matchId}`);
            } else {
              results.updated++;
              console.log(`🔄 Updated existing lineup for match: ${matchId}`);
            }
          } else {
            results.errors++;
            results.errorDetails.push(`${matchId}: ${syncResult.error}`);
            console.error(`❌ Error syncing lineup for match ${matchId}: ${syncResult.error}`);
          }

          // Rate limiting - wait 100ms between requests
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          results.errors++;
          results.errorDetails.push(`${matchId}: ${error.message}`);
          console.error(`❌ Unexpected error processing match ${matchId}:`, error.message);
        }
      }

      console.log(`📊 Batch sync completed: ${results.created} created, ${results.updated} updated, ${results.errors} errors`);

      return {
        success: true,
        data: results
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sync lineup data for a single match
   * @param {string} matchId - Match ID
   * @returns {Object} Sync result
   */
  async syncLineupForMatch(matchId) {
    const API_CONFIG = {
      BASE_URL: 'https://api.thesports.com/v1/football/match/lineup/detail',
      DEFAULT_PARAMS: {
        user: 'abcvty',
        secret: '5b2bae3b821a03197c8caa3083098d78'
      },
      TIMEOUT: 10000
    };

    try {
      // Fetch data from API
      const response = await axios.get(API_CONFIG.BASE_URL, {
        params: {
          ...API_CONFIG.DEFAULT_PARAMS,
          uuid: matchId
        },
        timeout: API_CONFIG.TIMEOUT
      });

      if (!response.data || !response.data.results || Object.keys(response.data.results).length === 0) {
        return {
          success: false,
          error: 'No lineup data found in API response'
        };
      }

      // Parse the lineup data
      const parsedData = this.parseLineupData(response.data.results, matchId);
      if (!parsedData) {
        return {
          success: false,
          error: 'Failed to parse lineup data'
        };
      }
      // Đảm bảo coach_id luôn là object có đủ home/away
      if (!parsedData.coach_id || typeof parsedData.coach_id !== 'object') {
        parsedData.coach_id = { home: null, away: null };
      }
      if (!('home' in parsedData.coach_id)) parsedData.coach_id.home = null;
      if (!('away' in parsedData.coach_id)) parsedData.coach_id.away = null;

      // Check if lineup already exists
      const existingLineup = await Lineup.findOne({ match_id: matchId });
      let isNew = false;
      if (existingLineup) {
        // Update existing lineup
        Object.assign(existingLineup, parsedData);
        await existingLineup.save();
      } else {
        // Create new lineup
        const newLineup = new Lineup(parsedData);
        await newLineup.save();
        isNew = true;
      }

      return {
        success: true,
        data: {
          match_id: matchId,
          isNew: isNew,
          lineup: parsedData
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Parse lineup data from API response
   * @param {Object} apiData - API response data
   * @param {string} matchId - Match ID
   * @returns {Object} Parsed lineup data
   */
  parseLineupData(apiData, matchId) {
    try {
      const parsedData = {
        match_id: matchId,
        confirmed: false,
        home_formation: '4-4-2',
        away_formation: '4-4-2',
        lineup: {
          home: [],
          away: []
        },
        injury: {
          home: [],
          away: []
        },
        coach_id: {
          home: null,
          away: null
        },
        updated_at: new Date()
      };

      // API trả về structure: results.confirmed, results.lineup.home, etc.
      if (apiData.confirmed !== undefined) {
        parsedData.confirmed = apiData.confirmed === 1 || apiData.confirmed === true;
      }
      
      if (apiData.home_formation) {
        parsedData.home_formation = apiData.home_formation;
      }
      
      if (apiData.away_formation) {
        parsedData.away_formation = apiData.away_formation;
      }

      // Parse coach_id
      if (apiData.coach_id) {
        parsedData.coach_id.home = apiData.coach_id.home || null;
        parsedData.coach_id.away = apiData.coach_id.away || null;
      }

      // Parse lineup data
      if (apiData.lineup) {
        if (apiData.lineup.home && Array.isArray(apiData.lineup.home)) {
          parsedData.lineup.home = this.processTeamPlayers(apiData.lineup.home);
        }
        
        if (apiData.lineup.away && Array.isArray(apiData.lineup.away)) {
          parsedData.lineup.away = this.processTeamPlayers(apiData.lineup.away);
        }
      }

      // Parse injury data - chỉ parse khi có dữ liệu hợp lệ
      if (apiData.injury) {
        if (apiData.injury.home && Array.isArray(apiData.injury.home) && apiData.injury.home.length > 0) {
          parsedData.injury.home = this.processInjuries(apiData.injury.home);
        }
        
        if (apiData.injury.away && Array.isArray(apiData.injury.away) && apiData.injury.away.length > 0) {
          parsedData.injury.away = this.processInjuries(apiData.injury.away);
        }
      }

  // Đảm bảo luôn có coach_id.home và coach_id.away (dù là null)
  if (!('home' in parsedData.coach_id)) parsedData.coach_id.home = null;
  if (!('away' in parsedData.coach_id)) parsedData.coach_id.away = null;
  return parsedData;

    } catch (error) {
      console.error('Error parsing lineup data:', error.message);
      return null;
    }
  }

  /**
   * Process team players data
   * @param {Array} players - Players array from API
   * @returns {Array} Processed players
   */
  processTeamPlayers(players) {
    if (!Array.isArray(players)) return [];
    
    return players.map(player => ({
      id: player.id || null,
      first: parseInt(player.first) || 0,
      captain: parseInt(player.captain) || 0,
      name: player.name || 'Unknown',
      logo: player.logo || '',
      shirt_number: parseInt(player.shirt_number) || 0,
      position: player.position || 'Unknown',
      x: parseFloat(player.x) || 0,
      y: parseFloat(player.y) || 0,
      rating: player.rating || '0.0',
      incidents: this.processPlayerIncidents(player.incidents || [])
    }));
  }

  /**
   * Process player incidents
   * @param {Array} incidents - Incidents array
   * @returns {Array} Processed incidents
   */
  processPlayerIncidents(incidents) {
    if (!Array.isArray(incidents)) return [];
    
    return incidents.map(incident => ({
      type: parseInt(incident.type) || 0,
      time: incident.time || '0',
      minute: parseInt(incident.minute) || 0,
      addtime: parseInt(incident.addtime) || 0,
      belong: parseInt(incident.belong) || 0,
      home_score: parseInt(incident.home_score) || 0,
      away_score: parseInt(incident.away_score) || 0,
      player: {
        id: incident.player?.id || null,
        name: incident.player?.name || null
      },
      assist1: {
        id: incident.assist1?.id || null,
        name: incident.assist1?.name || null
      },
      assist2: {
        id: incident.assist2?.id || null,
        name: incident.assist2?.name || null
      },
      in_player: {
        id: incident.in_player?.id || null,
        name: incident.in_player?.name || null
      },
      out_player: {
        id: incident.out_player?.id || null,
        name: incident.out_player?.name || null
      }
    }));
  }

  /**
   * Process injuries data
   * @param {Array} injuries - Injuries array from API
   * @returns {Array} Processed injuries
   */
  processInjuries(injuries) {
    if (!Array.isArray(injuries)) return [];
    
    return injuries
      .map(injury => ({
        id: injury.id || injury.player_id || null,
        name: injury.name || injury.player_name || 'Unknown',
        position: injury.position || 'Unknown',
        logo: injury.logo || '',
        type: parseInt(injury.type) || 0,
        reason: injury.reason || 'Unknown',
        start_time: parseInt(injury.start_time) || Math.floor(Date.now() / 1000),
        end_time: parseInt(injury.end_time) || Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // Always provide a valid end_time
        missed_matches: parseInt(injury.missed_matches) || 0
      }))
      .filter(injury => injury.id && injury.name && injury.position && injury.reason); // Chỉ giữ injury có đầy đủ thông tin
  }
}

module.exports = new LineupService();
