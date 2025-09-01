const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, description: 'Player id' },
  team_id: { type: String, required: true, description: 'Team id, 0 if retired/free/unknown' },
  name: { type: String, required: true, description: 'Player name' },
  short_name: { type: String, required: false, description: 'Player abbreviation' },
  logo: { type: String, required: false, description: 'Player logo' },
  national_logo: { type: String, required: false, description: 'Player logo (National team lineup)' },
  age: { type: Number, required: false, description: 'Age' },
  birthday: { type: Number, required: false, description: 'Birthday' },
  weight: { type: Number, required: false, description: 'Weight' },
  height: { type: Number, required: false, description: 'Height' },
  country_id: { type: String, required: false, description: 'Country id' },
  nationality: { type: String, required: false, description: 'Nationality' },
  market_value: { type: Number, required: false, description: 'Market value' },
  market_value_currency: { type: String, required: false, description: 'Market value unit' },
  contract_until: { type: Number, required: false, description: 'Contract deadline' },
  preferred_foot: { type: Number, required: false, description: 'Preferred foot: 0-unknown, 1-left, 2-right, 3-both' },
  ability: { type: [[mongoose.Schema.Types.Mixed]], required: false, description: 'Ability score' },
  characteristics: { type: [[mongoose.Schema.Types.Mixed]], required: false, description: 'Technical features' },
  position: { type: String, required: false, description: 'Good position' },
  positions: { type: [mongoose.Schema.Types.Mixed], required: false, description: 'Detailed positions' },
  uid: { type: String, required: false, description: 'Player id (merged)' },
  deathday: { type: Number, required: false, description: 'Time of death' },
  retire_time: { type: Number, required: false, description: 'Retirement time' },
  updated_at: { type: Number, required: true, description: 'Update time' }
});

module.exports = mongoose.model('Player', PlayerSchema);
