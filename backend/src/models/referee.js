const mongoose = require('mongoose');

const RefereeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, description: 'Referee id' },
  name: { type: String, required: true, description: 'Referee name' },
  short_name: { type: String, required: false, description: 'Referee abbreviation' },
  logo: { type: String, required: false, description: 'Referee logo' },
  birthday: { type: Number, required: false, description: 'Birthday' },
  country_id: { type: String, required: false, description: 'Country id' },
  uid: { type: String, required: false, description: 'Referee id (merged)' },
  updated_at: { type: Number, required: true, description: 'Update time' }
});

module.exports = mongoose.model('Referee', RefereeSchema);
