const mongoose = require('mongoose');

const StageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, description: 'Stage id' },
  season_id: { type: String, required: true, description: 'Season id' },
  name: { type: String, required: false, default: 'Unknown Stage', description: 'Stage name' },
  mode: { type: Number, required: false, description: 'Match mode, 1-points, 2-elimination' },
  group_count: { type: Number, required: false, description: 'Total groups' },
  round_count: { type: Number, required: false, description: 'Total rounds' },
  order: { type: Number, required: false, description: 'Sorting, the order of stages' },
  updated_at: { type: Number, required: false, default: () => Date.now(), description: 'Update time' }
});

module.exports = mongoose.model('Stage', StageSchema);
