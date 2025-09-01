const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, description: 'Team id' },
  competition_id: { type: String, required: false, description: 'Competition id (league only)' },
  country_id: { type: String, required: false, description: 'Country id' },
  name: { type: String, required: true, description: 'Team name' },
  short_name: { type: String, required: false, description: 'Team abbreviation' },
  logo: { type: String, required: false, description: 'Team logo' },
  national: { type: Number, required: false, description: 'Whether the national team, 1-Yes, 0-No' },
  country_logo: { type: String, required: false, description: 'National team logo (for national teams)' },
  foundation_time: { type: Number, required: false, description: 'Foundation time' },
  website: { type: String, required: false, description: 'Team official website' },
  coach_id: { type: String, required: false, description: 'Coach id' },
  venue_id: { type: String, required: false, description: 'Venue id' },
  market_value: { type: Number, required: false, description: 'Market value' },
  market_value_currency: { type: String, required: false, description: 'Market value unit' },
  total_players: { type: Number, required: false, description: 'Total players, -1 means no data' },
  foreign_players: { type: Number, required: false, description: 'Non-local players, -1 means no data' },
  national_players: { type: Number, required: false, description: 'National team players, -1 means no data' },
  uid: { type: String, required: false, description: 'Team id (merged)' },
  virtual: { type: Number, required: false, description: 'Whether the placeholder team, 1-Yes, 0-No' },
  gender: { type: Number, required: false, description: 'Gender 1. Male, 2. Female' },
  updated_at: { type: Number, required: true, description: 'Update time' }
});

module.exports = mongoose.model('Team', TeamSchema);
