const mongoose = require('mongoose');

const videoStreamSchema = new mongoose.Schema({
  sport_id: {
    type: Number,
    required: false,
    default: 1,
    description: 'Sport type: 1-football, 2-basketball'
  },
  match_id: {
    type: String,
    required: true,
    unique: true,
    description: 'Unique match identifier'
  },
  match_time: {
    type: Number,
    required: false,
    default: 0,
    description: 'Match timestamp'
  },
  match_status: {
    type: Number,
    required: false,
    default: 0,
    description: 'Match status code'
  },
  comp: {
    type: String,
    required: false,
    default: '',
    description: 'Competition name'
  },
  home: {
    type: String,
    required: false,
    default: '',
    description: 'Home team name'
  },
  away: {
    type: String,
    required: false,
    default: '',
    description: 'Away team name'
  },
  playurl1: {
    type: String,
    required: false,
    default: '',
    description: 'SD stream address (RTMP)'
  },
  playurl2: {
    type: String,
    required: false,
    default: '',
    description: 'English HD stream address (RTMP), can be empty'
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
videoStreamSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Index for efficient queries
videoStreamSchema.index({ match_id: 1 });
videoStreamSchema.index({ sport_id: 1 });
videoStreamSchema.index({ match_time: 1 });
videoStreamSchema.index({ match_status: 1 });
videoStreamSchema.index({ comp: 1 });
videoStreamSchema.index({ home: 1, away: 1 });

module.exports = mongoose.model('VideoStream', videoStreamSchema);
