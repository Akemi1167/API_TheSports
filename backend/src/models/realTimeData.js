const mongoose = require('mongoose');

// Schema cho match statistics
const MatchStatsSchema = new mongoose.Schema({
  type: { type: Number, required: false, default: 0, description: 'Type, see status code -> technical statistics' },
  home: { type: Number, required: false, default: 0, description: 'Home team value' },
  away: { type: Number, required: false, default: 0, description: 'Away team value' }
}, { _id: false });

// Schema cho match incidents
const MatchIncidentSchema = new mongoose.Schema({
  type: { type: Number, required: false, default: 0, description: 'Type, see status code -> technical statistics' },
  position: { type: Number, required: false, default: 0, description: 'The incident occurred, 0-neutral, 1-home team, 2-away team' },
  time: { type: Number, required: false, default: 0, description: 'Time (minutes)' },
  player_id: { type: String, required: false, description: 'Player id related to the incident, may not exist' },
  player_name: { type: String, required: false, description: 'Player name related to the incident, may not exist' },
  assist1_id: { type: String, required: false, description: 'Assist player 1 id, related to the goal incident, may not exist' },
  assist1_name: { type: String, required: false, description: 'Assist player 1 name, related to the goal incident, may not exist' },
  assist2_id: { type: String, required: false, description: 'Assist player 2 id, related to the goal incident, may not exist' },
  assist2_name: { type: String, required: false, description: 'Assist player 2 name, related to the goal incident, may not exist' },
  home_score: { type: Number, required: false, description: 'Home team score, related to the goal incident, may not exist' },
  away_score: { type: Number, required: false, description: 'Away team score, related to the goal incident, may not exist' },
  in_player_id: { type: String, required: false, description: 'Replace the player id(Put on), which is related to the substitution incident and may not exist' },
  in_player_name: { type: String, required: false, description: 'Replace the player name(Put on), which is related to the substitution incident and may not exist' },
  out_player_id: { type: String, required: false, description: 'Replace the player id(Replace), which is related to the substitution incident and may not exist' },
  out_player_name: { type: String, required: false, description: 'Replace the player name(Replace), which is related to the substitution incident and may not exist' },
  var_reason: { 
    type: Number, 
    required: false, 
    description: 'VAR reason: 1-Goal awarded, 2-Goal not awarded, 3-Penalty awarded, 4-Penalty not awarded, 5-Red card given, 6-Card upgrade, 7-Mistaken identity, 0-Other' 
  },
  var_result: { 
    type: Number, 
    required: false, 
    description: 'VAR result: 1-Goal confirmed, 2-Goal cancelled, 3-Penalty confirmed, 4-Penalty cancelled, 5-Red card confirmed, 6-Red card cancelled, 7-Card upgrade confirmed, 8-Card upgrade cancelled, 9-Original decision, 10-Original decision changed, 0-Unknown' 
  },
  reason_type: { type: Number, required: false, description: 'The reason for the red and yellow cards and substitution events, please refer to the status code -> event reason' }
}, { _id: false });

// Schema cho match text live
const MatchTextLiveSchema = new mongoose.Schema({
  time: { type: String, required: false, default: '', description: 'Time (minutes)' },
  data: { type: String, required: false, default: '', description: 'Contents' },
  position: { type: Number, required: false, default: 0, description: 'The incident occurred, 0-neutral, 1-home team, 2-away team' }
}, { _id: false });

// Main Real-time Data Schema
const RealTimeDataSchema = new mongoose.Schema({
  match_id: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true, 
    description: 'Match id' 
  },
  
  // Score data: [match_id, status, home_scores[7], away_scores[7], kickoff_timestamp, compatible_ignore]
  score: {
    match_id: { type: String, required: true, description: 'Match id' },
    status: { type: Number, required: true, description: 'Match status, please refer to Status Code -> Match Status' },
    home_scores: {
      regular_score: { type: Number, required: true, description: 'Home Team Score (regular time)' },
      halftime_score: { type: Number, required: true, description: 'Home Team Halftime score' },
      red_cards: { type: Number, required: true, description: 'Home Team Red cards' },
      yellow_cards: { type: Number, required: true, description: 'Home Team Yellow cards' },
      corners: { type: Number, required: true, description: 'Home Team Corners, -1 means no corner kick data' },
      overtime_score: { type: Number, required: true, description: 'Home Team Overtime score (120 minutes, including regular time), only available in overtime' },
      penalty_score: { type: Number, required: true, description: 'Home Team Penalty shootout score, only penalty shootout' }
    },
    away_scores: {
      regular_score: { type: Number, required: true, description: 'Away Team Score (regular time)' },
      halftime_score: { type: Number, required: true, description: 'Away Team Halftime score' },
      red_cards: { type: Number, required: true, description: 'Away Team Red cards' },
      yellow_cards: { type: Number, required: true, description: 'Away Team Yellow cards' },
      corners: { type: Number, required: true, description: 'Away Team Corners, -1 means no corner kick data' },
      overtime_score: { type: Number, required: true, description: 'Away Team Overtime score (120 minutes, including regular time), only available in overtime' },
      penalty_score: { type: Number, required: true, description: 'Away Team Penalty shootout score, only penalty shootout' }
    },
    kickoff_timestamp: { type: Number, required: true, description: 'Kick-off timestamp, kick-off time of the first/second half (judged according to the state of the match)' },
    compatible_ignore: { type: String, required: false, description: 'Compatible ignore' }
  },

  // Match statistics
  stats: [MatchStatsSchema],

  // Match incidents
  incidents: [MatchIncidentSchema],

  // Match text live
  tlive: [MatchTextLiveSchema],

  // Additional fields for tracking
  last_updated: { type: Number, required: true, description: 'Last update timestamp' },
  is_live: { type: Boolean, default: false, description: 'Whether the match is currently live' },
  data_source: { type: String, default: 'thesports_api', description: 'Source of the real-time data' },
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Index for efficient queries
RealTimeDataSchema.index({ match_id: 1, last_updated: -1 });
RealTimeDataSchema.index({ is_live: 1, last_updated: -1 });
RealTimeDataSchema.index({ 'score.status': 1 });

// Pre-save middleware to update the updated_at field
RealTimeDataSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model('RealTimeData', RealTimeDataSchema);
