const Lineup = require('../models/lineup');

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
}

module.exports = new LineupService();
