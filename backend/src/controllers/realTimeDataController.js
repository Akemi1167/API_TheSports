const realTimeDataService = require('../services/realTimeDataService');

class RealTimeDataController {
  async getAllRealTimeData(req, res) {
    try {
      const result = await realTimeDataService.getAllRealTimeData();
      
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

  async getRealTimeDataByMatchId(req, res) {
    try {
      const { match_id } = req.params;
      const result = await realTimeDataService.getRealTimeDataByMatchId(match_id);
      
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

  async getLiveMatches(req, res) {
    try {
      const result = await realTimeDataService.getLiveMatches();
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          total_live_matches: result.data.length,
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

  async getMatchesByStatus(req, res) {
    try {
      const { status } = req.params;
      const result = await realTimeDataService.getMatchesByStatus(parseInt(status));
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          status: parseInt(status),
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

  async getRecentlyUpdated(req, res) {
    try {
      const minutes = parseInt(req.query.minutes) || 30;
      const result = await realTimeDataService.getRecentlyUpdated(minutes);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          updated_within_minutes: minutes,
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

  async createOrUpdateRealTimeData(req, res) {
    try {
      const realTimeDataArray = req.body;
      
      if (!Array.isArray(realTimeDataArray)) {
        return res.status(400).json({
          success: false,
          error: 'Request body must be an array of real-time data objects'
        });
      }
      
      const result = await realTimeDataService.createOrUpdateRealTimeData(realTimeDataArray);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Real-time data processed successfully',
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

  async getMatchIncidents(req, res) {
    try {
      const { match_id } = req.params;
      const { type } = req.query;
      
      const incidentType = type ? parseInt(type) : null;
      const result = await realTimeDataService.getMatchIncidents(match_id, incidentType);
      
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

  async getMatchStats(req, res) {
    try {
      const { match_id } = req.params;
      const result = await realTimeDataService.getMatchStats(match_id);
      
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

  async getMatchTextLive(req, res) {
    try {
      const { match_id } = req.params;
      const result = await realTimeDataService.getMatchTextLive(match_id);
      
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

  async deleteRealTimeData(req, res) {
    try {
      const { match_id } = req.params;
      const result = await realTimeDataService.deleteRealTimeData(match_id);
      
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

module.exports = new RealTimeDataController();
