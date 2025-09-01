const venueService = require('../services/venueService');

// GET /api/venues - Lấy tất cả venues
const getAllVenues = async (req, res) => {
  const result = await venueService.getAllVenues();
  
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

// GET /api/venues/:id - Lấy venue theo ID
const getVenueById = async (req, res) => {
  const result = await venueService.getVenueById(req.params.id);
  
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
  getAllVenues,
  getVenueById
};
