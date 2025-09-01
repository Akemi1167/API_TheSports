const seasonService = require('../services/seasonService');

// GET /api/seasons - Lấy tất cả seasons
const getAllSeasons = async (req, res) => {
  const result = await seasonService.getAllSeasons();
  
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

// GET /api/seasons/:id - Lấy season theo ID
const getSeasonById = async (req, res) => {
  const result = await seasonService.getSeasonById(req.params.id);
  
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
  getAllSeasons,
  getSeasonById
};
