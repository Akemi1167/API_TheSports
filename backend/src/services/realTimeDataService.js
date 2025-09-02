const RealTimeData = require('../models/realTimeData');

class RealTimeDataService {
  async getAllRealTimeData() {
    try {
      const realTimeData = await RealTimeData.find().sort({ last_updated: -1 });
      return {
        success: true,
        data: realTimeData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getRealTimeDataByMatchId(match_id) {
    try {
      const realTimeData = await RealTimeData.findOne({ match_id });
      if (!realTimeData) {
        return {
          success: false,
          error: 'Real-time data not found',
          statusCode: 404
        };
      }
      return {
        success: true,
        data: realTimeData
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
      const liveMatches = await RealTimeData.find({ 
        is_live: true 
      }).sort({ last_updated: -1 });
      
      return {
        success: true,
        data: liveMatches
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getMatchesByStatus(status) {
    try {
      const matches = await RealTimeData.find({ 
        'score.status': status 
      }).sort({ last_updated: -1 });
      
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

  async getRecentlyUpdated(minutes = 30) {
    try {
      const cutoffTime = Date.now() - (minutes * 60 * 1000);
      const recentMatches = await RealTimeData.find({
        last_updated: { $gte: Math.floor(cutoffTime / 1000) }
      }).sort({ last_updated: -1 });
      
      return {
        success: true,
        data: recentMatches
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createOrUpdateRealTimeData(realTimeDataArray) {
    try {
      const results = {
        created: 0,
        updated: 0,
        errors: []
      };

      for (const data of realTimeDataArray) {
        try {
          const match_id = data.id || data.score[0]; // Sử dụng id từ API hoặc fallback to score[0]
          const currentTimestamp = Math.floor(Date.now() / 1000);

          // Parse the score array data
          const scoreData = {
            match_id: data.id || data.score[0],
            status: data.score[1],
            home_scores: {
              regular_score: data.score[2][0],
              halftime_score: data.score[2][1],
              red_cards: data.score[2][2],
              yellow_cards: data.score[2][3],
              corners: data.score[2][4],
              overtime_score: data.score[2][5],
              penalty_score: data.score[2][6]
            },
            away_scores: {
              regular_score: data.score[3][0],
              halftime_score: data.score[3][1],
              red_cards: data.score[3][2],
              yellow_cards: data.score[3][3],
              corners: data.score[3][4],
              overtime_score: data.score[3][5],
              penalty_score: data.score[3][6]
            },
            kickoff_timestamp: data.score[4],
            compatible_ignore: data.score[5] || ''
          };

          // Determine if match is live based on status
          const liveStatuses = [1, 2, 3, 4, 5]; // Define which statuses mean "live"
          const isLive = liveStatuses.includes(scoreData.status);

          const realTimeDataDoc = {
            match_id: match_id,
            score: scoreData,
            stats: data.stats || [],
            incidents: data.incidents || [],
            tlive: data.tlive || [],
            last_updated: currentTimestamp,
            is_live: isLive,
            data_source: 'thesports_api'
          };

          const existingData = await RealTimeData.findOne({ match_id });
          
          if (existingData) {
            await RealTimeData.updateOne(
              { match_id },
              { $set: realTimeDataDoc }
            );
            results.updated++;
          } else {
            await RealTimeData.create(realTimeDataDoc);
            results.created++;
          }

        } catch (itemError) {
          results.errors.push({
            match_id: data.id || (data.score ? data.score[0] : 'unknown'),
            error: itemError.message
          });
        }
      }

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

  async getMatchIncidents(match_id, incidentType = null) {
    try {
      const match = await RealTimeData.findOne({ match_id });
      if (!match) {
        return {
          success: false,
          error: 'Match not found',
          statusCode: 404
        };
      }

      let incidents = match.incidents;
      if (incidentType !== null) {
        incidents = incidents.filter(incident => incident.type === incidentType);
      }

      return {
        success: true,
        data: {
          match_id: match_id,
          incidents: incidents,
          total_incidents: incidents.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getMatchStats(match_id) {
    try {
      const match = await RealTimeData.findOne({ match_id });
      if (!match) {
        return {
          success: false,
          error: 'Match not found',
          statusCode: 404
        };
      }

      return {
        success: true,
        data: {
          match_id: match_id,
          score: match.score,
          stats: match.stats,
          last_updated: match.last_updated,
          is_live: match.is_live
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getMatchTextLive(match_id) {
    try {
      const match = await RealTimeData.findOne({ match_id });
      if (!match) {
        return {
          success: false,
          error: 'Match not found',
          statusCode: 404
        };
      }

      // Sort text live by time (most recent first)
      const sortedTlive = match.tlive.sort((a, b) => {
        const timeA = parseInt(a.time) || 0;
        const timeB = parseInt(b.time) || 0;
        return timeB - timeA;
      });

      return {
        success: true,
        data: {
          match_id: match_id,
          tlive: sortedTlive,
          total_events: sortedTlive.length,
          last_updated: match.last_updated
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteRealTimeData(match_id) {
    try {
      const result = await RealTimeData.deleteOne({ match_id });
      if (result.deletedCount === 0) {
        return {
          success: false,
          error: 'Real-time data not found',
          statusCode: 404
        };
      }
      return {
        success: true,
        data: { message: 'Real-time data deleted successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new RealTimeDataService();
