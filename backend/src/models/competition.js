const mongoose = require('mongoose');

const HostSchema = new mongoose.Schema({
  country: {
    type: String,
    required: false,
    description: 'Country'
  },
  city: {
    type: String,
    required: false,
    description: 'City, may not exist'
  }
}, { _id: false });

const CompetitionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, description: 'Competition id' },
  category_id: { type: String, required: true, description: 'Category id' },
  country_id: { type: String, required: false, description: 'Country id' },
  name: { type: String, required: true, description: 'Competition name' },
  short_name: { type: String, required: true, description: 'Competition abbreviation' },
  logo: { type: String, required: true, description: 'Competition logo' },
  type: { type: Number, required: true, description: 'Competition type: 0-unknown, 1-league, 2-cup, 3-friendly' },
  cur_season_id: { type: String, required: false, description: 'Current season id' },
  cur_stage_id: { type: String, required: false, description: 'Current stage id' },
  cur_round: { type: Number, required: false, description: 'Current round' },
  round_count: { type: Number, required: false, description: 'Total rounds' },
  title_holder: { type: [mongoose.Schema.Types.Mixed], required: false, description: 'Defending champion' },
  most_titles: { type: [mongoose.Schema.Types.Mixed], required: false, description: 'Most winning team' },
  newcomers: { type: [mongoose.Schema.Types.Mixed], required: false, description: 'Promoted/relegated teams' },
  divisions: { type: [mongoose.Schema.Types.Mixed], required: false, description: 'Competition level' },
  host: { type: HostSchema, required: false, description: 'Host' },
  gender: { type: Number, required: false, description: 'Gender 1. Male, 2. Female' },
  primary_color: { type: String, required: false, description: 'Main color' },
  secondary_color: { type: String, required: false, description: 'Secondary color' },
  uid: { type: String, required: false, description: 'Competition id (merged)' },
  updated_at: { type: Number, required: true, description: 'Update time' }
});

module.exports = mongoose.model('Competition', CompetitionSchema);
