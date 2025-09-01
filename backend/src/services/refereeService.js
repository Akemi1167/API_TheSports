const Referee = require('../models/referee');

class RefereeService {
  async getAllReferees() {
    try {
      const referees = await Referee.find();
      return {
        success: true,
        data: referees
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getRefereeById(id) {
    try {
      const referee = await Referee.findOne({ id });
      if (!referee) {
        return {
          success: false,
          error: 'Referee not found',
          statusCode: 404
        };
      }
      return {
        success: true,
        data: referee
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new RefereeService();
