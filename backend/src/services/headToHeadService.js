const HeadToHead = require('../models/headToHead');
const matchScoreService = require('./matchScoreService');

class HeadToHeadService {
  async getAllHeadToHeadData() {
    try {
      const h2hData = await HeadToHead.find().sort({ last_updated: -1 });
      return {
        success: true,
        data: h2hData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getHeadToHeadByTeams(homeTeamId, awayTeamId) {
    try {
      // Tìm theo cả 2 hướng (A vs B hoặc B vs A)
      const h2hData = await HeadToHead.findOne({
        $or: [
          { home_team_id: homeTeamId, away_team_id: awayTeamId },
          { home_team_id: awayTeamId, away_team_id: homeTeamId }
        ]
      });

      if (!h2hData) {
        return {
          success: false,
          error: 'Head-to-head data not found',
          statusCode: 404
        };
      }

      // Enhance với live scores
      const enhancedData = await matchScoreService.enhanceHeadToHeadWithScores(h2hData.toObject());

      return {
        success: true,
        data: enhancedData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getHeadToHeadById(h2hId) {
    try {
      const h2hData = await HeadToHead.findOne({ h2h_id: h2hId });
      
      if (!h2hData) {
        return {
          success: false,
          error: 'Head-to-head data not found',
          statusCode: 404
        };
      }

      // Enhance với live scores
      const enhancedData = await matchScoreService.enhanceHeadToHeadWithScores(h2hData.toObject());

      return {
        success: true,
        data: enhancedData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getTeamHistory(teamId, type = 'all') {
    try {
      let query = {};
      
      switch (type) {
        case 'home':
          query = { home_team_id: teamId };
          break;
        case 'away':
          query = { away_team_id: teamId };
          break;
        default:
          query = {
            $or: [
              { home_team_id: teamId },
              { away_team_id: teamId }
            ]
          };
      }

      const h2hData = await HeadToHead.find(query).sort({ 'info.match_time': -1 });
      
      // Enhance từng record với live scores
      const enhancedData = await Promise.all(
        h2hData.map(async (data) => {
          return await matchScoreService.enhanceHeadToHeadWithScores(data.toObject());
        })
      );
      
      return {
        success: true,
        data: enhancedData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getGoalDistribution(homeTeamId, awayTeamId) {
    try {
      const h2hData = await HeadToHead.findOne({
        $or: [
          { home_team_id: homeTeamId, away_team_id: awayTeamId },
          { home_team_id: awayTeamId, away_team_id: homeTeamId }
        ]
      });

      if (!h2hData) {
        return {
          success: false,
          error: 'Head-to-head data not found',
          statusCode: 404
        };
      }

      return {
        success: true,
        data: {
          home_team_id: h2hData.home_team_id,
          away_team_id: h2hData.away_team_id,
          goal_distribution: h2hData.goal_distribution
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createOrUpdateHeadToHead(h2hDataArray) {
    try {
      const results = {
        created: 0,
        updated: 0,
        errors: []
      };

      for (const data of h2hDataArray) {
        try {
          // Parse main match info
          const mainMatchInfo = HeadToHead.parseMatchInfoFromArray(data.info);
          
          // Generate H2H ID
          const h2hId = HeadToHead.generateH2HId(
            mainMatchInfo.home_team.team_id,
            mainMatchInfo.away_team.team_id
          );

          // Parse history data
          const historyData = {
            vs: data.history.vs ? data.history.vs.map(match => 
              HeadToHead.parseMatchInfoFromArray(match)
            ) : [],
            home: data.history.home ? data.history.home.map(match => 
              HeadToHead.parseMatchInfoFromArray(match)
            ) : [],
            away: data.history.away ? data.history.away.map(match => 
              HeadToHead.parseMatchInfoFromArray(match)
            ) : []
          };

          // Parse future data
          const futureData = {
            home: data.future.home ? data.future.home.map(match => 
              HeadToHead.parseMatchInfoFromArray(match)
            ) : [],
            away: data.future.away ? data.future.away.map(match => 
              HeadToHead.parseMatchInfoFromArray(match)
            ) : []
          };

          // Parse goal distribution data
          const goalDistribution = {
            home: this.parseGoalDistribution(data.goal_distribution.home),
            away: this.parseGoalDistribution(data.goal_distribution.away)
          };

          const h2hDoc = {
            h2h_id: h2hId,
            home_team_id: mainMatchInfo.home_team.team_id,
            away_team_id: mainMatchInfo.away_team.team_id,
            info: mainMatchInfo,
            history: historyData,
            future: futureData,
            goal_distribution: goalDistribution,
            last_updated: Math.floor(Date.now() / 1000),
            data_source: 'thesports_api'
          };

          const existingH2H = await HeadToHead.findOne({ h2h_id: h2hId });
          
          if (existingH2H) {
            await HeadToHead.updateOne(
              { h2h_id: h2hId },
              { $set: h2hDoc }
            );
            results.updated++;
          } else {
            await HeadToHead.create(h2hDoc);
            results.created++;
          }

        } catch (itemError) {
          results.errors.push({
            h2h_id: data.info ? `${data.info[5][0]}_vs_${data.info[6][0]}` : 'unknown',
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

  parseGoalDistribution(teamGoalData) {
    if (!teamGoalData) return null;

    const parseSegments = (segments) => {
      if (!Array.isArray(segments)) return [];
      return segments.map(segment => ({
        number: segment[0] || 0,
        percentage: segment[1] || 0,
        start_time: segment[2] || 0,
        end_time: segment[3] || 0
      }));
    };

    return {
      all: {
        matches: teamGoalData.all?.matches || 0,
        scored: parseSegments(teamGoalData.all?.scored),
        conceded: parseSegments(teamGoalData.all?.conceded)
      },
      home: {
        matches: teamGoalData.home?.matches || 0,
        scored: parseSegments(teamGoalData.home?.scored),
        conceded: parseSegments(teamGoalData.home?.conceded)
      },
      away: {
        matches: teamGoalData.away?.matches || 0,
        scored: parseSegments(teamGoalData.away?.scored),
        conceded: parseSegments(teamGoalData.away?.conceded)
      }
    };
  }

  async deleteHeadToHead(h2hId) {
    try {
      const result = await HeadToHead.deleteOne({ h2h_id: h2hId });
      
      if (result.deletedCount === 0) {
        return {
          success: false,
          error: 'Head-to-head data not found',
          statusCode: 404
        };
      }

      return {
        success: true,
        data: { message: 'Head-to-head data deleted successfully' }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getMatchHistory(homeTeamId, awayTeamId) {
    try {
      const h2hData = await HeadToHead.findOne({
        $or: [
          { home_team_id: homeTeamId, away_team_id: awayTeamId },
          { home_team_id: awayTeamId, away_team_id: homeTeamId }
        ]
      });

      if (!h2hData) {
        return {
          success: false,
          error: 'Head-to-head data not found',
          statusCode: 404
        };
      }

      // Tính toán thống kê đối đầu
      const vsHistory = h2hData.history.vs || [];
      let homeWins = 0, awayWins = 0, draws = 0;

      vsHistory.forEach(match => {
        const homeScore = match.home_team.regular_score;
        const awayScore = match.away_team.regular_score;
        
        if (homeScore > awayScore) {
          if (match.home_team.team_id === homeTeamId) homeWins++;
          else awayWins++;
        } else if (awayScore > homeScore) {
          if (match.away_team.team_id === homeTeamId) homeWins++;
          else awayWins++;
        } else {
          draws++;
        }
      });

      // Enhance matches với live scores
      const enhancedRecentMatches = await matchScoreService.enhanceMultipleMatches(vsHistory.slice(0, 10));
      const enhancedAllMatches = await matchScoreService.enhanceMultipleMatches(vsHistory);

      return {
        success: true,
        data: {
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          total_matches: vsHistory.length,
          home_wins: homeWins,
          away_wins: awayWins,
          draws: draws,
          recent_matches: enhancedRecentMatches, // 10 trận gần nhất với live scores
          all_matches: enhancedAllMatches // Tất cả trận với live scores
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getFutureMatches(teamId) {
    try {
      const h2hData = await HeadToHead.find({
        $or: [
          { home_team_id: teamId },
          { away_team_id: teamId }
        ]
      });

      let futureMatches = [];
      
      h2hData.forEach(h2h => {
        if (h2h.home_team_id === teamId && h2h.future.home) {
          futureMatches.push(...h2h.future.home);
        }
        if (h2h.away_team_id === teamId && h2h.future.away) {
          futureMatches.push(...h2h.future.away);
        }
      });

      // Sắp xếp theo thời gian trận đấu
      futureMatches.sort((a, b) => a.match_time - b.match_time);

      // Enhance future matches với live scores (mostly 0-0 cho chưa bắt đầu)
      const enhancedFutureMatches = await matchScoreService.enhanceMultipleMatches(futureMatches);

      return {
        success: true,
        data: {
          team_id: teamId,
          total_future_matches: futureMatches.length,
          matches: enhancedFutureMatches
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

module.exports = new HeadToHeadService();
