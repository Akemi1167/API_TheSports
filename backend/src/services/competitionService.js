const Competition = require('../models/competition');

class CompetitionService {
  async getAllCompetitions() {
    try {
      const competitions = await Competition.find();
      return {
        success: true,
        data: competitions
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getCompetitionById(id) {
    try {
      const competition = await Competition.findOne({ id });
      if (!competition) {
        return {
          success: false,
          error: 'Competition not found',
          statusCode: 404
        };
      }
      return {
        success: true,
        data: competition
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new CompetitionService();
