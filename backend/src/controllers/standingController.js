const standingService = require('../services/standingService');
const { syncStandings } = require('../cron/standingCron');

class StandingController {
  // GET /api/standings/season/:season_id - Lấy xếp hạng theo season
  async getStandingBySeason(req, res) {
    try {
      const { season_id } = req.params;
      const result = await standingService.getStandingBySeason(season_id);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
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
  
  // GET /api/standings/stage/:stage_id - Lấy xếp hạng theo stage
  async getStandingByStage(req, res) {
    try {
      const { stage_id } = req.params;
      const result = await standingService.getStandingByStage(stage_id);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
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
  
  // GET /api/standings/table/:table_id - Lấy xếp hạng theo table
  async getStandingByTable(req, res) {
    try {
      const { table_id } = req.params;
      const result = await standingService.getStandingByTable(table_id);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
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
  
  // GET /api/standings/team/:team_id - Lấy thông tin đội trong xếp hạng
  async getTeamStanding(req, res) {
    try {
      const { team_id } = req.params;
      const { season_id } = req.query;
      
      const result = await standingService.getTeamStanding(team_id, season_id);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          team_id: team_id,
          season_id: season_id || 'all',
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
  
  // GET /api/standings/group/:season_id/:group_number - Lấy xếp hạng theo group
  async getStandingByGroup(req, res) {
    try {
      const { season_id, group_number } = req.params;
      const groupNum = parseInt(group_number);
      
      const result = await standingService.getStandingByGroup(season_id, groupNum);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
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
  
  // POST /api/standings/sync - Đồng bộ dữ liệu standings từ API
  async syncStandingsData(req, res) {
    try {
      console.log('🏆 Manual standings sync triggered');
      await syncStandings();
      res.json({
        success: true,
        message: 'Standings synchronization completed successfully'
      });
    } catch (error) {
      console.error('❌ Manual standings sync failed:', error);
      res.status(500).json({
        success: false,
        message: 'Standings synchronization failed',
        error: error.message
      });
    }
  }
}

module.exports = new StandingController();
