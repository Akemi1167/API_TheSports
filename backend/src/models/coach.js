const mongoose = require('mongoose');

const CoachSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, description: 'Coach id' },
  team_id: { type: String, required: false, description: 'Coaching team id' },
  name: { type: String, required: true, description: 'Coach name' },
  short_name: { type: String, required: false, description: 'Coach abbreviation' },
  logo: { type: String, required: false, description: 'Coach logo' },
  type: { type: Number, required: false, description: 'Type 1. Head coach 2. Interim head coach' },
  birthday: { type: Number, required: false, description: 'Birthday' },
  age: { type: Number, required: false, description: 'Age' },
  preferred_formation: { type: String, required: false, description: 'Custom formation' },
  country_id: { type: String, required: false, description: 'Country id' },
  nationality: { type: String, required: false, description: 'Nationality' },
  joined: { type: Number, required: false, description: 'Join Time' },
  contract_until: { type: Number, required: false, description: 'Contract expiration' },
  uid: { type: String, required: false, description: 'Coach id (merged)' },
  deathday: { type: Number, required: false, description: 'Time of death' },
  updated_at: { type: Number, required: true, description: 'Update time' }
});

module.exports = mongoose.model('Coach', CoachSchema);
