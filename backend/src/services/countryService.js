const Country = require('../models/country');

class CountryService {
  async getAllCountries() {
    try {
      const countries = await Country.find();
      return {
        success: true,
        data: countries
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getCountryById(id) {
    try {
      const country = await Country.findOne({ id });
      if (!country) {
        return {
          success: false,
          error: 'Country not found',
          statusCode: 404
        };
      }
      return {
        success: true,
        data: country
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new CountryService();
