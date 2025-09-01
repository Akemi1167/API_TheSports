const coachService = require('../services/coachService');

// GET /api/coaches - Lấy tất cả coaches
const getAllCoaches = async (req, res) => {
  const result = await coachService.getAllCoaches();
  
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

// GET /api/coaches/:id - Lấy coach theo ID
const getCoachById = async (req, res) => {
  const result = await coachService.getCoachById(req.params.id);
  
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
  getAllCoaches,
  getCoachById
};
