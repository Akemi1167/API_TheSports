const matchService = require('../services/matchService');
const { syncMatches } = require('../cron/matchCron');

class MatchController {
  
  // POST /api/matches/sync - Đồng bộ dữ liệu matches từ API
  async syncMatchesData(req, res) {
    try {
      console.log('🏃‍♂️ Manual matches sync triggered');
      
      const { season_id, comp_id, limit } = req.body;
      
      await matchService.syncMatchesFromAPI({
        seasonId: season_id,
        compId: comp_id,
        limit: limit || 1000
      });
      
      res.json({
        success: true,
        message: 'Matches synchronization completed successfully'
      });
    } catch (error) {
      console.error('❌ Manual matches sync failed:', error);
      res.status(500).json({
        success: false,
        message: 'Matches synchronization failed',
        error: error.message
      });
    }
  }
  
  // GET /api/matches/stats - Lấy thống kê matches
  async getMatchStats(req, res) {
    try {
      const result = await matchService.getMatchStats();
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data
        });
      }
      
      return res.status(500).json({
        success: false,
        error: result.error
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  // GET /api/matches/team/:team_id - Lấy matches của đội
  async getTeamMatches(req, res) {
    try {
      const { team_id } = req.params;
      const { 
        limit = 10,
        season_id,
        comp_id,
        status,
        only_finished 
      } = req.query;
      
      const result = await matchService.getTeamRecentMatches(team_id, {
        limit: parseInt(limit),
        seasonId: season_id,
        compId: comp_id,
        status: status ? parseInt(status) : null,
        onlyFinished: only_finished === 'true'
      });
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          team_id: team_id,
          total: result.data.length,
          data: result.data
        });
      }
      
      const statusCode = result.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        error: result.error
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  // GET /api/matches/competition/:comp_id - Lấy matches theo competition
  async getCompetitionMatches(req, res) {
    try {
      const { comp_id } = req.params;
      const { 
        season_id,
        limit = 50,
        status,
        sort_by = 'match_time',
        sort_order = 'desc'
      } = req.query;
      
      const result = await matchService.getMatchesByCompetition(comp_id, season_id, {
        limit: parseInt(limit),
        status: status ? parseInt(status) : null,
        sortBy: sort_by,
        sortOrder: sort_order === 'desc' ? -1 : 1
      });
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          comp_id: comp_id,
          season_id: season_id || 'all',
          total: result.data.length,
          data: result.data
        });
      }
      
      return res.status(500).json({
        success: false,
        error: result.error
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
  
  // GET /api/matches/team/:team_id/last5 - Lấy form Last 5 của đội
  async getTeamLast5Form(req, res) {
    try {
      const { team_id } = req.params;
      const { season_id } = req.query;
      
      // Import standingService for Last 5 functionality
      const standingService = require('../services/standingService');
      
      const result = await standingService.getTeamLast5Form(team_id, season_id);
      
      if (result.success && result.data) {
        return res.status(200).json({
          success: true,
          team_id: team_id,
          form: result.data.last5_form,
          matches_count: result.data.matches?.length || 0,
          matches: result.data.matches || []
        });
      }
      
      const statusCode = result.error === 'No completed matches found for this team' ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        error: result.error
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/matches/:match_id/standings - Lấy bảng xếp hạng từ match_id với Last 5
  async getStandingsFromMatch(req, res) {
    try {
      const { match_id } = req.params;
      
      const matchStandingService = require('../services/matchStandingService');
      const result = await matchStandingService.getStandingFromMatch(match_id);
      
      if (result.success) {
        return res.status(200).json(result.data);
      }
      
      const statusCode = result.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        error: result.error
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/matches/:match_id/teams-comparison - So sánh 2 đội từ match_id
  async getTeamsComparison(req, res) {
    try {
      const { match_id } = req.params;
      
      const matchStandingService = require('../services/matchStandingService');
      const result = await matchStandingService.getTeamsComparison(match_id);
      
      if (result.success) {
        return res.status(200).json(result.data);
      }
      
      const statusCode = result.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        error: result.error
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // GET /api/matches/:match_id/area-standings - Lấy bảng xếp hạng xung quanh 2 đội
  async getMatchAreaStandings(req, res) {
    try {
      const { match_id } = req.params;
      const { range = 3 } = req.query;
      
      const matchStandingService = require('../services/matchStandingService');
      const result = await matchStandingService.getMatchAreaStandings(match_id, parseInt(range));
      
      if (result.success) {
        return res.status(200).json(result.data);
      }
      
      const statusCode = result.statusCode || 500;
      return res.status(statusCode).json({
        success: false,
        error: result.error
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new MatchController();