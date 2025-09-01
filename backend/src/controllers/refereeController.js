const refereeService = require('../services/refereeService');

// GET /api/referees - Lấy tất cả referees
const getAllReferees = async (req, res) => {
  const result = await refereeService.getAllReferees();
  
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

// GET /api/referees/:id - Lấy referee theo ID
const getRefereeById = async (req, res) => {
  const result = await refereeService.getRefereeById(req.params.id);
  
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
  getAllReferees,
  getRefereeById
};
