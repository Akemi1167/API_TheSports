const Stage = require('../models/stage');

class StageService {
  async getAllStages() {
    try {
      const stages = await Stage.find();
      return {
        success: true,
        data: stages
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getStageById(id) {
    try {
      const stage = await Stage.findOne({ id });
      if (!stage) {
        return {
          success: false,
          error: 'Stage not found',
          statusCode: 404
        };
      }
      return {
        success: true,
        data: stage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new StageService();
