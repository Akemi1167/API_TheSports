const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, description: 'Venue id' },
  name: { type: String, required: true, description: 'Venue name' },
  capacity: { type: Number, required: false, description: 'Stadium capacity' },
  country_id: { type: String, required: false, description: 'Country id' },
  city: { type: String, required: false, description: 'City' },
  country: { type: String, required: false, description: 'Country' },
  updated_at: { type: Number, required: true, description: 'Update time' }
});

module.exports = mongoose.model('Venue', VenueSchema);
