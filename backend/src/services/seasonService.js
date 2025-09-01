const Season = require('../models/season');

class SeasonService {
  async getAllSeasons() {
    try {
      const seasons = await Season.find();
      return {
        success: true,
        data: seasons
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getSeasonById(id) {
    try {
      const season = await Season.findOne({ id });
      if (!season) {
        return {
          success: false,
          error: 'Season not found',
          statusCode: 404
        };
      }
      return {
        success: true,
        data: season
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new SeasonService();
