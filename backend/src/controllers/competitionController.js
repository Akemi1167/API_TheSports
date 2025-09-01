const competitionService = require('../services/competitionService');

// GET /api/competitions - Lấy tất cả competitions
const getAllCompetitions = async (req, res) => {
  const result = await competitionService.getAllCompetitions();
  
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

// GET /api/competitions/:id - Lấy competition theo ID
const getCompetitionById = async (req, res) => {
  const result = await competitionService.getCompetitionById(req.params.id);
  
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
  getAllCompetitions,
  getCompetitionById
};
