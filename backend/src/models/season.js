const mongoose = require('mongoose');

const SeasonSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, description: 'Season id' },
  competition_id: { type: String, required: true, description: 'Competition id' },
  year: { type: String, required: true, description: 'Season year' },
  has_player_stats: { type: Number, required: false, description: 'Is there any player statistics, 1-Yes, 0-No' },
  has_team_stats: { type: Number, required: false, description: 'Are there team statistics, 1-Yes, 0-No' },
  has_table: { type: Number, required: false, description: 'Is there a standings, 1-Yes, 0-No' },
  is_current: { type: Number, required: false, description: 'Whether the latest season, 1-Yes, 0-No' },
  start_time: { type: Number, required: false, description: 'Start time' },
  end_time: { type: Number, required: false, description: 'End Time' },
  updated_at: { type: Number, required: true, description: 'Update time' }
});

module.exports = mongoose.model('Season', SeasonSchema);
