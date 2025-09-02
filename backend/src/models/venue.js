const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, description: 'Venue id' },
  name: { type: String, required: false, default: 'Unknown Venue', description: 'Venue name' },
  capacity: { type: Number, required: false, description: 'Stadium capacity' },
  country_id: { type: String, required: false, description: 'Country id' },
  city: { type: String, required: false, description: 'City' },
  country: { type: String, required: false, description: 'Country' },
  updated_at: { type: Number, required: false, default: () => Date.now(), description: 'Update time' }
});

module.exports = mongoose.model('Venue', VenueSchema);
