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
  
  // GET /api/standings/team/:team_id/last5 - Lấy Last 5 form của đội
  async getTeamLast5Form(req, res) {
    try {
      const { team_id } = req.params;
      const { season_id, comp_id } = req.query;
      
      const result = await standingService.getTeamLast5Form(team_id, season_id, comp_id);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          team_id: team_id,
          season_id: season_id || 'all',
          comp_id: comp_id || 'all',
          last5_form: result.data.last5_form,
          matches: result.data.matches
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

  // GET /api/standings/season/:season_id/last5 - Lấy bảng xếp hạng với Last 5 form (sử dụng real match data)
  async getSeasonLast5Form(req, res) {
    try {
      const { season_id } = req.params;
      const { comp_id, limit = 50, table_id, group, sync_matches = false } = req.query;
      
      // Tùy chọn sync matches trước khi lấy Last 5 để có data mới nhất
      if (sync_matches === 'true') {
        console.log(`🔄 Syncing matches for season ${season_id} before getting Last 5...`);
        const seasonMatchService = require('../services/seasonMatchService');
        try {
          await seasonMatchService.syncSeasonMatches(season_id, { comp_id });
          console.log(`✅ Season matches synced successfully`);
        } catch (error) {
          console.warn(`⚠️ Failed to sync season matches: ${error.message}`);
        }
      }
      
      const standingWithLast5Service = require('../services/standingWithLast5Service');
      const result = await standingWithLast5Service.getStandingsWithLast5(season_id, {
        comp_id,
        limit: parseInt(limit),
        table_id,
        group: group ? parseInt(group) : null
      });
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          season_id: season_id,
          comp_id: comp_id || 'all',
          standings: result.data.standings,
          table_info: result.data.table_info,
          promotions: result.data.promotions,
          total_teams: result.data.total_teams,
          updated_at: result.data.updated_at,
          matches_synced: sync_matches === 'true'
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

  // POST /api/standings/season/:season_id/sync-matches - Đồng bộ matches cho season
  async syncSeasonMatches(req, res) {
    try {
      const { season_id } = req.params;
      const { comp_id } = req.body;
      
      console.log(`🔄 Manual season matches sync triggered for season: ${season_id}`);
      
      const seasonMatchService = require('../services/seasonMatchService');
      const result = await seasonMatchService.syncSeasonMatches(season_id, { comp_id });
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Season matches synchronization completed successfully',
          season_id: season_id,
          synced_matches: result.syncedCount
        });
      } else {
        return res.status(500).json({
          success: false,
          error: result.error,
          season_id: season_id
        });
      }
      
    } catch (error) {
      console.error('❌ Manual season matches sync failed:', error);
      return res.status(500).json({
        success: false,
        message: 'Season matches synchronization failed',
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
