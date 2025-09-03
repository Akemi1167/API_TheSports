const RealTimeData = require('../models/realTimeData');
const MatchEnums = require('../constants/matchEnums');

class MatchScoreService {
  /**
   * Enhance match data với thông tin tỷ số
   * @param {Object} matchData - Dữ liệu trận đấu
   * @returns {Object} Match data đã được enhance với score
   */
  async enhanceMatchWithScore(matchData) {
    try {
      const enhancedMatch = { ...matchData };
      
      // Lấy match_id từ info nếu có
      const matchId = matchData.info?.match_id || matchData.match_id;
      
      if (!matchId) {
        // Nếu không có match_id, set default score 0-0
        enhancedMatch.live_score = {
          home: 0,
          away: 0,
          status: 'unknown',
          status_description: 'Unknown',
          is_live: false,
          last_updated: null
        };
        return enhancedMatch;
      }

      // Lấy match status từ data
      const matchStatus = matchData.info?.match_status || matchData.match_status;
      
      // Xác định trận đấu chưa bắt đầu (status = 1)
      if (matchStatus === MatchEnums.MatchStates.NOT_STARTED.code) {
        enhancedMatch.live_score = {
          home: 0,
          away: 0,
          status: 'not_started',
          status_description: 'Not started',
          is_live: false,
          last_updated: null
        };
        return enhancedMatch;
      }

      // Lấy dữ liệu realtime nếu trận đấu đang diễn ra hoặc đã kết thúc
      const realtimeData = await RealTimeData.findOne({ match_id: matchId });
      
      if (realtimeData && realtimeData.score) {
        enhancedMatch.live_score = {
          home: realtimeData.score.home_scores?.regular_score || 0,
          away: realtimeData.score.away_scores?.regular_score || 0,
          status: this.getStatusString(realtimeData.score.status),
          status_description: MatchEnums.getMatchStateDescription(realtimeData.score.status) || 'Unknown',
          is_live: realtimeData.is_live || false,
          last_updated: realtimeData.last_updated,
          halftime: {
            home: realtimeData.score.home_scores?.halftime_score || 0,
            away: realtimeData.score.away_scores?.halftime_score || 0
          },
          additional_info: {
            home_red_cards: realtimeData.score.home_scores?.red_cards || 0,
            away_red_cards: realtimeData.score.away_scores?.red_cards || 0,
            home_yellow_cards: realtimeData.score.home_scores?.yellow_cards || 0,
            away_yellow_cards: realtimeData.score.away_scores?.yellow_cards || 0,
            home_corners: realtimeData.score.home_scores?.corners || 0,
            away_corners: realtimeData.score.away_scores?.corners || 0
          }
        };
      } else {
        // Không tìm thấy dữ liệu realtime, sử dụng default
        enhancedMatch.live_score = {
          home: 0,
          away: 0,
          status: this.getStatusString(matchStatus),
          status_description: MatchEnums.getMatchStateDescription(matchStatus) || 'Unknown',
          is_live: false,
          last_updated: null
        };
      }

      return enhancedMatch;
    } catch (error) {
      console.error('❌ Error enhancing match with score:', error);
      // Return original data với default score nếu có lỗi
      return {
        ...matchData,
        live_score: {
          home: 0,
          away: 0,
          status: 'error',
          status_description: 'Error fetching score',
          is_live: false,
          last_updated: null
        }
      };
    }
  }

  /**
   * Enhance multiple matches với score data
   * @param {Array} matchesArray - Mảng các trận đấu
   * @returns {Array} Mảng matches đã được enhance
   */
  async enhanceMultipleMatches(matchesArray) {
    try {
      if (!Array.isArray(matchesArray)) {
        return matchesArray;
      }

      const enhancedMatches = await Promise.all(
        matchesArray.map(async (match) => {
          return await this.enhanceMatchWithScore(match);
        })
      );

      return enhancedMatches;
    } catch (error) {
      console.error('❌ Error enhancing multiple matches:', error);
      return matchesArray; // Return original data nếu có lỗi
    }
  }

  /**
   * Enhance head-to-head data với scores
   * @param {Object} h2hData - Head-to-head data
   * @returns {Object} H2H data đã được enhance
   */
  async enhanceHeadToHeadWithScores(h2hData) {
    try {
      if (!h2hData) return h2hData;

      const enhanced = { ...h2hData };

      // Enhance main info nếu có
      if (enhanced.info) {
        enhanced.info = await this.enhanceMatchWithScore(enhanced.info);
      }

      // Enhance history matches
      if (enhanced.history) {
        if (enhanced.history.vs) {
          enhanced.history.vs = await this.enhanceMultipleMatches(enhanced.history.vs);
        }
        if (enhanced.history.home) {
          enhanced.history.home = await this.enhanceMultipleMatches(enhanced.history.home);
        }
        if (enhanced.history.away) {
          enhanced.history.away = await this.enhanceMultipleMatches(enhanced.history.away);
        }
      }

      // Enhance future matches
      if (enhanced.future) {
        if (enhanced.future.home) {
          enhanced.future.home = await this.enhanceMultipleMatches(enhanced.future.home);
        }
        if (enhanced.future.away) {
          enhanced.future.away = await this.enhanceMultipleMatches(enhanced.future.away);
        }
      }

      return enhanced;
    } catch (error) {
      console.error('❌ Error enhancing H2H with scores:', error);
      return h2hData; // Return original data nếu có lỗi
    }
  }

  /**
   * Lấy current live scores cho nhiều match IDs
   * @param {Array} matchIds - Mảng match IDs
   * @returns {Object} Object chứa scores theo match_id
   */
  async getCurrentScores(matchIds) {
    try {
      if (!Array.isArray(matchIds) || matchIds.length === 0) {
        return {};
      }

      const realtimeData = await RealTimeData.find({
        match_id: { $in: matchIds }
      }).select('match_id score is_live last_updated');

      const scoresMap = {};
      realtimeData.forEach(data => {
        scoresMap[data.match_id] = {
          home: data.score?.home_scores?.regular_score || 0,
          away: data.score?.away_scores?.regular_score || 0,
          status: this.getStatusString(data.score?.status),
          is_live: data.is_live || false,
          last_updated: data.last_updated
        };
      });

      return scoresMap;
    } catch (error) {
      console.error('❌ Error getting current scores:', error);
      return {};
    }
  }

  /**
   * Chuyển đổi status code thành string
   * @param {number} statusCode - Match status code
   * @returns {string} Status string
   */
  getStatusString(statusCode) {
    const statusMap = {
      0: 'abnormal',
      1: 'not_started',
      2: 'first_half',
      3: 'half_time',
      4: 'second_half', 
      5: 'overtime',
      6: 'overtime_deprecated',
      7: 'penalty_shootout',
      8: 'finished',
      9: 'delayed',
      10: 'interrupted',
      11: 'cut_in_half',
      12: 'cancelled',
      13: 'to_be_determined'
    };

    return statusMap[statusCode] || 'unknown';
  }

  /**
   * Kiểm tra trận đấu có đang live không
   * @param {number} statusCode - Match status code
   * @returns {boolean} True nếu đang live
   */
  isMatchLive(statusCode) {
    const liveStatuses = [2, 3, 4, 5, 7]; // First half, Half-time, Second half, Overtime, Penalty shootout
    return liveStatuses.includes(statusCode);
  }

  /**
   * Lấy live matches hiện tại
   * @returns {Array} Mảng live matches với scores
   */
  async getLiveMatches() {
    try {
      const liveMatches = await RealTimeData.find({
        is_live: true
      }).select('match_id score is_live last_updated').sort({ last_updated: -1 });

      return liveMatches.map(match => ({
        match_id: match.match_id,
        live_score: {
          home: match.score?.home_scores?.regular_score || 0,
          away: match.score?.away_scores?.regular_score || 0,
          status: this.getStatusString(match.score?.status),
          status_description: MatchEnums.getMatchStateDescription(match.score?.status) || 'Unknown',
          is_live: match.is_live,
          last_updated: match.last_updated
        }
      }));
    } catch (error) {
      console.error('❌ Error getting live matches:', error);
      return [];
    }
  }
}

module.exports = new MatchScoreService();
