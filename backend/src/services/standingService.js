const Standing = require('../models/standing');
const Match = require('../models/match');
const { timestampToDateTime } = require('../utils/timestampUtils');

class StandingService {
  // Lấy xếp hạng theo season_id
  async getStandingBySeason(seasonId) {
    try {
      const standing = await Standing.findOne({ season_id: seasonId }).lean();
      
      if (!standing) {
        return {
          success: false,
          statusCode: 404,
          error: 'Standing not found for this season'
        };
      }
      
      return {
        success: true,
        data: standing
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Lấy xếp hạng theo stage_id
  async getStandingByStage(stageId) {
    try {
      const standings = await Standing.find({
        'tables.stage_id': stageId
      }).lean();
      
      if (!standings || standings.length === 0) {
        return {
          success: false,
          statusCode: 404,
          error: 'Standing not found for this stage'
        };
      }
      
      // Filter chỉ lấy tables có stage_id phù hợp
      const filteredStandings = standings.map(standing => ({
        ...standing,
        tables: standing.tables.filter(table => table.stage_id === stageId)
      }));
      
      return {
        success: true,
        data: filteredStandings
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Lấy xếp hạng theo table_id
  async getStandingByTable(tableId) {
    try {
      const standing = await Standing.findOne({
        'tables.id': tableId
      }).lean();
      
      if (!standing) {
        return {
          success: false,
          statusCode: 404,
          error: 'Standing table not found'
        };
      }
      
      // Tìm table cụ thể
      const table = standing.tables.find(t => t.id === tableId);
      
      return {
        success: true,
        data: {
          season_id: standing.season_id,
          promotions: standing.promotions,
          table: table,
          updated_at: standing.updated_at
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Lấy thông tin đội trong xếp hạng
  async getTeamStanding(teamId, seasonId = null) {
    try {
      let query = { 'tables.rows.team_id': teamId };
      if (seasonId) {
        query.season_id = seasonId;
      }
      
      const standings = await Standing.find(query).lean();
      
      if (!standings || standings.length === 0) {
        return {
          success: false,
          statusCode: 404,
          error: 'Team standing not found'
        };
      }
      
      // Tìm thông tin đội trong tất cả các bảng
      const teamStandings = [];
      
      standings.forEach(standing => {
        standing.tables.forEach(table => {
          const teamRow = table.rows.find(row => row.team_id === teamId);
          if (teamRow) {
            teamStandings.push({
              season_id: standing.season_id,
              table_id: table.id,
              stage_id: table.stage_id,
              conference: table.conference,
              group: table.group,
              team_data: teamRow,
              updated_at: standing.updated_at
            });
          }
        });
      });
      
      return {
        success: true,
        data: teamStandings
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Lấy xếp hạng theo group
  async getStandingByGroup(seasonId, groupNumber) {
    try {
      const standing = await Standing.findOne({
        season_id: seasonId,
        'tables.group': groupNumber
      }).lean();
      
      if (!standing) {
        return {
          success: false,
          statusCode: 404,
          error: 'Group standing not found'
        };
      }
      
      // Filter chỉ lấy tables của group đó
      const groupTables = standing.tables.filter(table => table.group === groupNumber);
      
      return {
        success: true,
        data: {
          season_id: standing.season_id,
          promotions: standing.promotions,
          tables: groupTables,
          updated_at: standing.updated_at
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Tạo hoặc cập nhật xếp hạng
  async createOrUpdateStanding(standingData) {
    try {
      const result = await Standing.findOneAndUpdate(
        { season_id: standingData.season_id },
        {
          ...standingData,
          updated_at: Date.now()
        },
        { 
          upsert: true, 
          new: true,
          runValidators: true
        }
      );
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper function để tính kết quả trận đấu từ góc nhìn của đội
  _getMatchResult(match, teamId) {
    // Chỉ tính các trận đã kết thúc (status_id = 3)
    if (match.status_id !== 3) {
      return null;
    }

    // Get scores from arrays (index 0 = regular time score)
    const homeScore = match.home_scores && match.home_scores[0] !== undefined ? match.home_scores[0] : null;
    const awayScore = match.away_scores && match.away_scores[0] !== undefined ? match.away_scores[0] : null;

    // Nếu không có score thì không tính
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

    return {
      match_id: match.match_id,
      match_time: match.match_time,
      match_datetime: timestampToDateTime(match.match_time),
      home_team: {
        id: match.home_team_id,
        name: `Team ${match.home_team_id}` // We'll need to join with teams collection for names
      },
      away_team: {
        id: match.away_team_id,
        name: `Team ${match.away_team_id}` // We'll need to join with teams collection for names
      },
      score: {
        home: homeScore,
        away: awayScore
      },
      result: result,
      venue: isHome ? 'home' : 'away',
      competition: match.competition_id || 'Unknown'
    };
  }

  // Lấy Last 5 form của một đội
  async getTeamLast5Form(teamId, seasonId = null, compId = null) {
    try {
      // Tạo query để tìm matches của đội
      let matchQuery = {
        $or: [
          { home_team_id: teamId },
          { away_team_id: teamId }
        ],
        status_id: 3 // Status 3 = finished matches from API
      };

      // Thêm filter theo season nếu có
      if (seasonId) {
        matchQuery.season_id = seasonId;
      }

      // Thêm filter theo competition nếu có
      if (compId) {
        matchQuery.competition_id = compId;
      }

      // Lấy matches, sắp xếp theo thời gian giảm dần (mới nhất trước)
      const matches = await Match.find(matchQuery)
        .sort({ match_time: -1 })
        .limit(5)
        .lean();

      if (!matches || matches.length === 0) {
        return {
          success: false,
          statusCode: 404,
          error: 'No completed matches found for this team'
        };
      }

      // Xử lý kết quả từng trận
      const processedMatches = [];
      let formString = '';

      matches.forEach(match => {
        const matchResult = this._getMatchResult(match, teamId);
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
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Lấy Last 5 form cho tất cả đội trong season
  async getSeasonLast5Form(seasonId, compId = null, limit = 50) {
    try {
      // Lấy danh sách đội từ standings
      const standing = await Standing.findOne({ season_id: seasonId }).lean();
      
      if (!standing || !standing.tables || standing.tables.length === 0) {
        return {
          success: false,
          statusCode: 404,
          error: 'No standings found for this season'
        };
      }

      // Thu thập tất cả team IDs từ các bảng xếp hạng
      const teamIds = new Set();
      const teamNames = new Map();

      standing.tables.forEach(table => {
        if (table.rows) {
          table.rows.forEach(row => {
            teamIds.add(row.team_id);
            // Lấy team name từ Team model nếu có, hoặc dùng team_id
            teamNames.set(row.team_id, row.team_id); // Tạm thời dùng team_id làm name
          });
        }
      });

      const teamsArray = Array.from(teamIds).slice(0, limit);
      const results = [];

      // Lấy Last 5 form cho từng đội
      for (const teamId of teamsArray) {
        try {
          const teamFormResult = await this.getTeamLast5Form(teamId, seasonId, compId);
          
          if (teamFormResult.success) {
            const formString = teamFormResult.data.last5_form;
            
            // Tính points từ form (W=3, D=1, L=0)
            let formPoints = 0;
            for (let char of formString) {
              if (char === 'W') formPoints += 3;
              else if (char === 'D') formPoints += 1;
            }

            results.push({
              team_id: teamId,
              team_name: teamNames.get(teamId),
              last5_form: formString,
              form_points: formPoints,
              matches_played: formString.length
            });
          }
        } catch (error) {
          console.error(`Error getting Last 5 for team ${teamId}:`, error.message);
          // Tiếp tục với đội tiếp theo nếu có lỗi
        }
      }

      // Sắp xếp theo form points (cao xuống thấp)
      results.sort((a, b) => b.form_points - a.form_points);

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
}

module.exports = new StandingService();
