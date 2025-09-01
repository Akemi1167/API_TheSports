const teamService = require('../services/teamService');

// GET /api/teams - Lấy tất cả teams
const getAllTeams = async (req, res) => {
  const result = await teamService.getAllTeams();
  
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

// GET /api/teams/:id - Lấy team theo ID
const getTeamById = async (req, res) => {
  const result = await teamService.getTeamById(req.params.id);
  
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
  getAllTeams,
  getTeamById
};
