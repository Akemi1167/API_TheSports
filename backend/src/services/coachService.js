const Coach = require('../models/coach');

class CoachService {
  async getAllCoaches() {
    try {
      const coaches = await Coach.find();
      return {
        success: true,
        data: coaches
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getCoachById(id) {
    try {
      const coach = await Coach.findOne({ id });
      if (!coach) {
        return {
          success: false,
          error: 'Coach not found',
          statusCode: 404
        };
      }
      return {
        success: true,
        data: coach
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new CoachService();
