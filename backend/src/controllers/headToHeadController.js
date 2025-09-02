const headToHeadService = require('../services/headToHeadService');

class HeadToHeadController {
  async getAllHeadToHeadData(req, res) {
    try {
      const result = await headToHeadService.getAllHeadToHeadData();
      
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

  async getHeadToHeadByTeams(req, res) {
    try {
      const { home_team_id, away_team_id } = req.params;
      const result = await headToHeadService.getHeadToHeadByTeams(home_team_id, away_team_id);
      
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

  async getHeadToHeadById(req, res) {
    try {
      const { h2h_id } = req.params;
      const result = await headToHeadService.getHeadToHeadById(h2h_id);
      
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

  async getTeamHistory(req, res) {
    try {
      const { team_id } = req.params;
      const { type } = req.query; // all, home, away
      
      const result = await headToHeadService.getTeamHistory(team_id, type);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          team_id: team_id,
          type: type || 'all',
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

  async getGoalDistribution(req, res) {
    try {
      const { home_team_id, away_team_id } = req.params;
      const result = await headToHeadService.getGoalDistribution(home_team_id, away_team_id);
      
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

  async getMatchHistory(req, res) {
    try {
      const { home_team_id, away_team_id } = req.params;
      const result = await headToHeadService.getMatchHistory(home_team_id, away_team_id);
      
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

  async getFutureMatches(req, res) {
    try {
      const { team_id } = req.params;
      const result = await headToHeadService.getFutureMatches(team_id);
      
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

  async createOrUpdateHeadToHead(req, res) {
    try {
      const h2hDataArray = req.body;
      
      if (!Array.isArray(h2hDataArray)) {
        return res.status(400).json({
          success: false,
          error: 'Request body must be an array of head-to-head data objects'
        });
      }
      
      const result = await headToHeadService.createOrUpdateHeadToHead(h2hDataArray);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Head-to-head data processed successfully',
          summary: {
            created: result.data.created,
            updated: result.data.updated,
            errors: result.data.errors.length,
            total_processed: result.data.created + result.data.updated
          },
          errors: result.data.errors
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

  async deleteHeadToHead(req, res) {
    try {
      const { h2h_id } = req.params;
      const result = await headToHeadService.deleteHeadToHead(h2h_id);
      
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
}

module.exports = new HeadToHeadController();
