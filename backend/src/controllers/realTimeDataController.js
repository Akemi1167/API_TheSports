const realTimeDataService = require('../services/realTimeDataService');

class RealTimeDataController {
  // GET /api/realtime/:match_id - Lấy dữ liệu real-time theo match_id
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
}

module.exports = new RealTimeDataController();
