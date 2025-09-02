const venueService = require('../services/venueService');
const { syncVenues } = require('../cron/venueCron');

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

// POST /api/venues/sync - Đồng bộ dữ liệu venues từ API
const syncVenuesData = async (req, res) => {
  try {
    console.log('🏟️ Manual venue sync triggered');
    await syncVenues();
    res.json({
      code: 200,
      message: 'Venues synchronization completed successfully'
    });
  } catch (error) {
    console.error('❌ Manual venue sync failed:', error);
    res.status(500).json({
      code: 500,
      message: 'Venues synchronization failed',
      error: error.message
    });
  }
};

module.exports = {
  getAllVenues,
  getVenueById,
  syncVenuesData
};
