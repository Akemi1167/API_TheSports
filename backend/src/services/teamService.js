const Team = require('../models/team');

class TeamService {
  async getAllTeams() {
    try {
      const teams = await Team.find();
      return {
        success: true,
        data: teams
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getTeamById(id) {
    try {
      const team = await Team.findOne({ id });
      if (!team) {
        return {
          success: false,
          error: 'Team not found',
          statusCode: 404
        };
      }
      return {
        success: true,
        data: team
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new TeamService();
