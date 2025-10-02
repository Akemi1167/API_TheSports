const Match = require('../models/match');
const Team = require('../models/team');
const Standing = require('../models/standing');
const standingWithLast5Service = require('./standingWithLast5Service');

class MatchStandingService {

  /**
   * Lấy bảng xếp hạng từ match_id với thông tin Last 5
   * @param {string} matchId - Match ID
   * @returns {object} - Bảng xếp hạng với thông tin Last 5
   */
  async getStandingFromMatch(matchId) {
    try {
      console.log(`🏆 Getting standings from match: ${matchId}`);
      
      // Tìm thông tin trận đấu
      const match = await Match.findOne({ match_id: matchId }).lean();
      if (!match) {
        return {
          success: false,
          error: `Match not found: ${matchId}`,
          statusCode: 404
        };
      }
      
      console.log(`⚽ Found match: ${match.home_team_id} vs ${match.away_team_id}`);
      
      // Lấy bảng xếp hạng với Last 5 cho season và competition
      const standingsResult = await standingWithLast5Service.getStandingsWithLast5(match.season_id, {
        comp_id: match.comp_id
      });
      
      if (!standingsResult.success) {
        return standingsResult;
      }
      
      // Lấy thông tin teams
      const [homeTeam, awayTeam] = await Promise.all([
        Team.findOne({ team_id: match.home_team_id }).lean(),
        Team.findOne({ team_id: match.away_team_id }).lean()
      ]);
      
      return {
        success: true,
        data: {
          match_info: {
            match_id: matchId,
            season_id: match.season_id,
            comp_id: match.comp_id,
            home_team_id: match.home_team_id,
            away_team_id: match.away_team_id,
            match_datetime: match.match_datetime,
            status_id: match.status_id
          },
          standings: standingsResult.data,
          match_teams: {
            home: homeTeam,
            away: awayTeam
          },
          teams_info: {
            home: this._findTeamInStandings(standingsResult.data.standings, match.home_team_id),
            away: this._findTeamInStandings(standingsResult.data.standings, match.away_team_id)
          }
        }
      };
      
    } catch (error) {
      console.error('❌ Error getting standings from match:', error);
      return {
        success: false,
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * So sánh thứ hạng và form của 2 đội từ match_id
   * @param {string} matchId - Match ID
   * @returns {object} - So sánh 2 đội
   */
  async getTeamsComparison(matchId) {
    try {
      console.log(`⚖️ Getting teams comparison for match: ${matchId}`);
      
      const standingsResult = await this.getStandingFromMatch(matchId);
      if (!standingsResult.success) {
        return standingsResult;
      }
      
      const { teams_info, match_teams } = standingsResult.data;
      const homeTeamData = teams_info.home;
      const awayTeamData = teams_info.away;
      
      if (!homeTeamData || !awayTeamData) {
        return {
          success: false,
          error: 'Cannot find both teams in standings',
          statusCode: 404
        };
      }
      
      const positionDiff = homeTeamData.position - awayTeamData.position;
      const pointsDiff = homeTeamData.points - awayTeamData.points;
      
      return {
        success: true,
        data: {
          home_team: {
            ...match_teams.home,
            position: homeTeamData.position,
            points: homeTeamData.points,
            last5_form: homeTeamData.last5_form,
            last5_points: homeTeamData.last5_summary?.points || 0,
            form_rating: homeTeamData.last5_summary?.form_rating || 'Unknown'
          },
          away_team: {
            ...match_teams.away,
            position: awayTeamData.position,
            points: awayTeamData.points,
            last5_form: awayTeamData.last5_form,
            last5_points: awayTeamData.last5_summary?.points || 0,
            form_rating: awayTeamData.last5_summary?.form_rating || 'Unknown'
          },
          comparison: {
            position_difference: positionDiff,
            points_difference: pointsDiff,
            higher_team: positionDiff < 0 ? 'home' : positionDiff > 0 ? 'away' : 'equal',
            higher_form: this._compareForm(homeTeamData.last5_summary, awayTeamData.last5_summary)
          }
        }
      };
      
    } catch (error) {
      console.error('❌ Error getting teams comparison:', error);
      return {
        success: false,
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Lấy bảng xếp hạng xung quanh vị trí của 2 đội
   * @param {string} matchId - Match ID  
   * @param {number} range - Số đội xung quanh để hiển thị
   * @returns {object} - Bảng xếp hạng khu vực
   */
  async getMatchAreaStandings(matchId, range = 3) {
    try {
      console.log(`📊 Getting area standings for match: ${matchId}, range: ${range}`);
      
      const standingsResult = await this.getStandingFromMatch(matchId);
      if (!standingsResult.success) {
        return standingsResult;
      }
      
      const { teams_info, standings, match_info } = standingsResult.data;
      const homePos = teams_info.home?.position;
      const awayPos = teams_info.away?.position;
      
      if (!homePos || !awayPos) {
        return {
          success: false,
          error: 'Cannot determine teams positions',
          statusCode: 404
        };
      }
      
      // Tính toán khoảng hiển thị
      const minPos = Math.min(homePos, awayPos);
      const maxPos = Math.max(homePos, awayPos);
      const startPos = Math.max(1, minPos - range);
      const endPos = Math.min(standings.standings.length, maxPos + range);
      
      // Lọc teams trong khoảng
      const areaTeams = standings.standings.filter(team => 
        team.position >= startPos && team.position <= endPos
      );
      
      return {
        success: true,
        data: {
          match_info,
          table_info: {
            comp_id: standings.comp_id,
            season_id: standings.season_id,
            table_name: standings.table_name || 'League Table'
          },
          position_range: {
            start: startPos,
            end: endPos,
            total_teams: standings.standings.length
          },
          teams: areaTeams,
          match_teams: {
            home_position: homePos,
            away_position: awayPos,
            home_team_id: match_info.home_team_id,
            away_team_id: match_info.away_team_id
          }
        }
      };
      
    } catch (error) {
      console.error('❌ Error getting area standings:', error);
      return {
        success: false,
        error: error.message,
        statusCode: 500
      };
    }
  }

  /**
   * Tìm team trong bảng xếp hạng
   * @private
   */
  _findTeamInStandings(standings, teamId) {
    return standings.find(team => team.team_id === teamId);
  }

  /**
   * So sánh form giữa 2 đội
   * @private
   */
  _compareForm(homeForm, awayForm) {
    const homePoints = homeForm?.points || 0;
    const awayPoints = awayForm?.points || 0;
    
    if (homePoints > awayPoints) return 'home';
    if (awayPoints > homePoints) return 'away';
    return 'equal';
  }
}

module.exports = new MatchStandingService();