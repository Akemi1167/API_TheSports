const Player = require('../models/player');

class PlayerService {
  async getAllPlayers() {
    try {
      const players = await Player.find();
      return {
        success: true,
        data: players
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getPlayerById(id) {
    try {
      const player = await Player.findOne({ id });
      if (!player) {
        return {
          success: false,
          error: 'Player not found',
          statusCode: 404
        };
      }
      return {
        success: true,
        data: player
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new PlayerService();
