const countryService = require('../services/countryService');

// GET /api/countries - Lấy tất cả countries
const getAllCountries = async (req, res) => {
  const result = await countryService.getAllCountries();
  
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

// GET /api/countries/:id - Lấy country theo ID
const getCountryById = async (req, res) => {
  const result = await countryService.getCountryById(req.params.id);
  
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
  getAllCountries,
  getCountryById
};
