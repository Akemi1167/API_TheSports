const playerService = require('../services/playerService');

// GET /api/players - Lấy tất cả players
const getAllPlayers = async (req, res) => {
  const result = await playerService.getAllPlayers();
  
  if (result.success) {
    res.json({
      code: 200,
      results: result.data
    });
  } else {
    res.status(500).json({
      code: 500,
      message: result.error
    });
  }
};

// GET /api/players/:id - Lấy player theo ID
const getPlayerById = async (req, res) => {
  const result = await playerService.getPlayerById(req.params.id);
  
  if (result.success) {
    res.json({
      code: 200,
      result: result.data
    });
  } else {
    const statusCode = result.statusCode || 500;
    res.status(statusCode).json({
      code: statusCode,
      message: result.error
    });
  }
};

module.exports = {
  getAllPlayers,
  getPlayerById
};
