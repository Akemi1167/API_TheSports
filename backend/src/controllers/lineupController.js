const lineupService = require('../services/lineupService');

class LineupController {
  // GET /api/lineups/match/:match_id - Lấy lineup theo match ID
  async getLineupByMatchId(req, res) {
    try {
      const { match_id } = req.params;
      const result = await lineupService.getLineupByMatchId(match_id);
      
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

  // GET /api/lineups/match/:match_id/starting-eleven - Lấy starting eleven
  async getStartingEleven(req, res) {
    try {
      const { match_id } = req.params;
      const { team } = req.query; // 'home', 'away', or 'both'
      
      const result = await lineupService.getStartingEleven(match_id, team);
      
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

  // GET /api/lineups/match/:match_id/substitutes - Lấy substitutes
  async getSubstitutes(req, res) {
    try {
      const { match_id } = req.params;
      const { team } = req.query; // 'home', 'away', or 'both'
      
      const result = await lineupService.getSubstitutes(match_id, team);
      
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

  // GET /api/lineups/match/:match_id/player/:player_id - Lấy thông tin cầu thủ
  async getPlayerInLineup(req, res) {
    try {
      const { match_id, player_id } = req.params;
      const result = await lineupService.getPlayerInLineup(match_id, player_id);
      
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

  // GET /api/lineups/match/:match_id/incidents - Lấy tất cả incidents
  async getMatchIncidents(req, res) {
    try {
      const { match_id } = req.params;
      const result = await lineupService.getMatchIncidents(match_id);
      
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

  // GET /api/lineups/match/:match_id/player/:player_id/incidents - Lấy incidents của cầu thủ
  async getPlayerIncidents(req, res) {
    try {
      const { match_id, player_id } = req.params;
      const result = await lineupService.getPlayerIncidents(match_id, player_id);
      
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

  // GET /api/lineups/match/:match_id/injuries - Lấy injury data
  async getInjuryData(req, res) {
    try {
      const { match_id } = req.params;
      const result = await lineupService.getInjuryData(match_id);
      
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

  // GET /api/lineups/match/:match_id/captains - Lấy captains
  async getCaptains(req, res) {
    try {
      const { match_id } = req.params;
      const result = await lineupService.getCaptains(match_id);
      
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

  // GET /api/lineups/coach/:coach_id - Lấy lineups theo coach
  async getLineupsByCoach(req, res) {
    try {
      const { coach_id } = req.params;
      const result = await lineupService.getLineupsByCoach(coach_id);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
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

  // GET /api/lineups/player/:player_id - Lấy lineups theo player
  async getLineupsByPlayer(req, res) {
    try {
      const { player_id } = req.params;
      const result = await lineupService.getLineupsByPlayer(player_id);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
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

  // GET /api/lineups/match/:match_id/formation-analysis - Phân tích formation
  async getFormationAnalysis(req, res) {
    try {
      const { match_id } = req.params;
      const result = await lineupService.getFormationAnalysis(match_id);
      
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

  // POST /api/lineups/sync - Đồng bộ lineup data (manual)
  async syncLineupData(req, res) {
    try {
      // This would typically call the lineup sync cron job
      // For now, return a placeholder response
      res.json({
        success: true,
        message: 'Lineup synchronization triggered successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lineup synchronization failed',
        error: error.message
      });
    }
  }
}

module.exports = new LineupController();
