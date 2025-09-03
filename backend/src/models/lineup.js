const mongoose = require('mongoose');

// Player Incident Schema
const PlayerIncidentSchema = new mongoose.Schema({
  type: { 
    type: Number, 
    required: true, 
    description: 'Incident type - see technical statistics codes' 
  },
  time: { 
    type: String, 
    required: true, 
    description: 'Incident time (including extra time)' 
  },
  minute: { 
    type: Number, 
    required: true, 
    description: 'Match minute when incident occurred' 
  },
  addtime: { 
    type: Number, 
    default: 0, 
    description: 'Additional time (e.g., 45+2 means minute:45, addtime:2)' 
  },
  belong: { 
    type: Number, 
    required: true, 
    description: 'Team involved - 0:neutral, 1:home, 2:away' 
  },
  home_score: { 
    type: Number, 
    default: 0, 
    description: 'Home team score when incident occurred' 
  },
  away_score: { 
    type: Number, 
    default: 0, 
    description: 'Away team score when incident occurred' 
  },
  player: {
    id: { type: String, description: 'Player ID' },
    name: { type: String, description: 'Player name' }
  },
  assist1: {
    id: { type: String, description: 'First assist player ID' },
    name: { type: String, description: 'First assist player name' }
  },
  assist2: {
    id: { type: String, description: 'Second assist player ID' },
    name: { type: String, description: 'Second assist player name' }
  },
  in_player: {
    id: { type: String, description: 'Substitution - player coming in ID' },
    name: { type: String, description: 'Substitution - player coming in name' }
  },
  out_player: {
    id: { type: String, description: 'Substitution - player going out ID' },
    name: { type: String, description: 'Substitution - player going out name' }
  }
}, { _id: false });

// Player Lineup Schema
const PlayerLineupSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    description: 'Player ID' 
  },
  first: { 
    type: Number, 
    required: true, 
    description: 'Starting player - 1:Yes, 0:No' 
  },
  captain: { 
    type: Number, 
    default: 0, 
    description: 'Team captain - 1:Yes, 0:No' 
  },
  name: { 
    type: String, 
    required: true, 
    description: 'Player name' 
  },
  logo: { 
    type: String, 
    default: '', 
    description: 'Player logo/photo URL' 
  },
  shirt_number: { 
    type: Number, 
    required: true, 
    description: 'Jersey number' 
  },
  position: { 
    type: String, 
    required: true, 
    description: 'Player position - F:forward, M:midfielder, D:defender, G:goalkeeper' 
  },
  x: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100, 
    description: 'X coordinate (0-100)' 
  },
  y: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100, 
    description: 'Y coordinate (0-100)' 
  },
  rating: { 
    type: String, 
    default: '', 
    description: 'Player rating (max 10.0)' 
  },
  incidents: [PlayerIncidentSchema]
}, { _id: false });

// Injury Data Schema
const InjuryDataSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    description: 'Player ID' 
  },
  name: { 
    type: String, 
    required: true, 
    description: 'Player name' 
  },
  position: { 
    type: String, 
    required: true, 
    description: 'Player position' 
  },
  logo: { 
    type: String, 
    default: '', 
    description: 'Player logo/photo URL' 
  },
  type: { 
    type: Number, 
    required: true, 
    description: 'Injury type - 0:unknown, 1:injured, 2:suspended' 
  },
  reason: { 
    type: String, 
    required: true, 
    description: 'Injury/suspension reason' 
  },
  start_time: { 
    type: Number, 
    required: true, 
    description: 'Start timestamp' 
  },
  end_time: { 
    type: Number, 
    required: true, 
    description: 'End timestamp' 
  },
  missed_matches: { 
    type: Number, 
    default: 0, 
    description: 'Number of matches affected' 
  }
}, { _id: false });

// Main Lineup Schema
const LineupSchema = new mongoose.Schema({
  match_id: { 
    type: String, 
    required: true, 
    unique: true, 
    description: 'Match ID' 
  },
  confirmed: { 
    type: Number, 
    required: true, 
    description: 'Official lineup confirmed - 1:yes, 0:no' 
  },
  home_formation: { 
    type: String, 
    default: '', 
    description: 'Home team formation (e.g., "4-4-2")' 
  },
  away_formation: { 
    type: String, 
    default: '', 
    description: 'Away team formation (e.g., "4-3-3")' 
  },
  coach_id: {
    home: { 
      type: String, 
      required: false, 
      description: 'Home team coach ID' 
    },
    away: { 
      type: String, 
      required: false, 
      description: 'Away team coach ID' 
    }
  },
  lineup: {
    home: [PlayerLineupSchema],
    away: [PlayerLineupSchema]
  },
  injury: {
    home: [InjuryDataSchema],
    away: [InjuryDataSchema]
  },
  last_updated: { 
    type: Number, 
    default: () => Math.floor(Date.now() / 1000), 
    description: 'Last update timestamp' 
  },
  data_source: { 
    type: String, 
    default: 'thesports_api', 
    description: 'Data source' 
  }
}, {
  timestamps: true,
  collection: 'lineups'
});

// Create indexes for better query performance
LineupSchema.index({ match_id: 1 });
LineupSchema.index({ 'lineup.home.id': 1 });
LineupSchema.index({ 'lineup.away.id': 1 });
LineupSchema.index({ 'coach_id.home': 1 });
LineupSchema.index({ 'coach_id.away': 1 });
LineupSchema.index({ last_updated: -1 });

// Static methods
LineupSchema.statics.findByMatchId = function(matchId) {
  return this.findOne({ match_id: matchId });
};

LineupSchema.statics.findByPlayerId = function(playerId) {
  return this.find({
    $or: [
      { 'lineup.home.id': playerId },
      { 'lineup.away.id': playerId }
    ]
  });
};

LineupSchema.statics.findByCoachId = function(coachId) {
  return this.find({
    $or: [
      { 'coach_id.home': coachId },
      { 'coach_id.away': coachId }
    ]
  });
};

// Instance methods
LineupSchema.methods.getPlayerStats = function(playerId) {
  let playerData = null;
  let team = null;
  
  // Search in home team
  const homePlayer = this.lineup.home.find(p => p.id === playerId);
  if (homePlayer) {
    playerData = homePlayer;
    team = 'home';
  }
  
  // Search in away team if not found in home
  if (!playerData) {
    const awayPlayer = this.lineup.away.find(p => p.id === playerId);
    if (awayPlayer) {
      playerData = awayPlayer;
      team = 'away';
    }
  }
  
  return { player: playerData, team };
};

LineupSchema.methods.getStartingEleven = function(teamType = 'both') {
  const result = {};
  
  if (teamType === 'home' || teamType === 'both') {
    result.home = this.lineup.home.filter(p => p.first === 1);
  }
  
  if (teamType === 'away' || teamType === 'both') {
    result.away = this.lineup.away.filter(p => p.first === 1);
  }
  
  return result;
};

LineupSchema.methods.getSubstitutes = function(teamType = 'both') {
  const result = {};
  
  if (teamType === 'home' || teamType === 'both') {
    result.home = this.lineup.home.filter(p => p.first === 0);
  }
  
  if (teamType === 'away' || teamType === 'both') {
    result.away = this.lineup.away.filter(p => p.first === 0);
  }
  
  return result;
};

LineupSchema.methods.getCaptains = function() {
  const homeCaptain = this.lineup.home.find(p => p.captain === 1);
  const awayCaptain = this.lineup.away.find(p => p.captain === 1);
  
  return {
    home: homeCaptain || null,
    away: awayCaptain || null
  };
};

LineupSchema.methods.getPlayerIncidents = function(playerId) {
  const { player } = this.getPlayerStats(playerId);
  return player ? player.incidents : [];
};

LineupSchema.methods.getAllIncidents = function() {
  const allIncidents = [];
  
  // Collect incidents from home team
  this.lineup.home.forEach(player => {
    if (player.incidents && player.incidents.length > 0) {
      player.incidents.forEach(incident => {
        allIncidents.push({
          ...incident.toObject(),
          player_team: 'home',
          player_info: {
            id: player.id,
            name: player.name,
            shirt_number: player.shirt_number,
            position: player.position
          }
        });
      });
    }
  });
  
  // Collect incidents from away team
  this.lineup.away.forEach(player => {
    if (player.incidents && player.incidents.length > 0) {
      player.incidents.forEach(incident => {
        allIncidents.push({
          ...incident.toObject(),
          player_team: 'away',
          player_info: {
            id: player.id,
            name: player.name,
            shirt_number: player.shirt_number,
            position: player.position
          }
        });
      });
    }
  });
  
  // Sort by minute and addtime
  return allIncidents.sort((a, b) => {
    if (a.minute !== b.minute) {
      return a.minute - b.minute;
    }
    return a.addtime - b.addtime;
  });
};

const Lineup = mongoose.model('Lineup', LineupSchema);

module.exports = Lineup;
