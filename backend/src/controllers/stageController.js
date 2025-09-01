const stageService = require('../services/stageService');

// GET /api/stages - Lấy tất cả stages
const getAllStages = async (req, res) => {
  const result = await stageService.getAllStages();
  
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

// GET /api/stages/:id - Lấy stage theo ID
const getStageById = async (req, res) => {
  const result = await stageService.getStageById(req.params.id);
  
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
  getAllStages,
  getStageById
};
