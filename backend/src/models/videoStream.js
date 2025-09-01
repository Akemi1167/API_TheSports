const mongoose = require('mongoose');

const videoStreamSchema = new mongoose.Schema({
  sport_id: {
    type: Number,
    required: true,
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
    required: true,
    description: 'Match timestamp'
  },
  pushurl1: {
    type: String,
    required: true,
    description: 'SD stream address (RTMP)'
  },
  pushurl2: {
    type: String,
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

module.exports = mongoose.model('VideoStream', videoStreamSchema);
