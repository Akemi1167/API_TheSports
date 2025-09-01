const Venue = require('../models/venue');

class VenueService {
  async getAllVenues() {
    try {
      const venues = await Venue.find();
      return {
        success: true,
        data: venues
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getVenueById(id) {
    try {
      const venue = await Venue.findOne({ id });
      if (!venue) {
        return {
          success: false,
          error: 'Venue not found',
          statusCode: 404
        };
      }
      return {
        success: true,
        data: venue
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new VenueService();
