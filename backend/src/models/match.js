const mongoose = require('mongoose');

/**
 * Match Schema for TheSports API
 * Updated to match the new API structure from /match/recent/list
 */
const matchSchema = new mongoose.Schema({
  // Match identification - using 'id' from API as match_id
  match_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: 'Unique match identifier (from API field: id)'
  },
  
  // Competition and season information
  season_id: {
    type: String,
    required: true,
    index: true,
    description: 'Season ID'
  },
  competition_id: {
    type: String,
    required: true,
    index: true,
    description: 'Competition ID'
  },
  
  // Teams information
  home_team_id: {
    type: String,
    required: true,
    index: true,
    description: 'Home team ID'
  },
  away_team_id: {
    type: String,
    required: true,
    index: true,
    description: 'Away team ID'
  },
  
  // Match timing
  match_time: {
    type: Number,
    required: true,
    index: true,
    description: 'Match timestamp (Unix timestamp)'
  },
  
  // Match status
  status_id: {
    type: Number,
    required: true,
    index: true,
    description: 'Match status ID'
  },
  
  // Venue and officials
  venue_id: {
    type: String,
    default: '',
    description: 'Venue ID'
  },
  referee_id: {
    type: String,
    default: '',
    description: 'Referee ID'
  },
  
  // Match properties
  neutral: {
    type: Number,
    default: 0,
    description: 'Is neutral venue (1=Yes, 0=No)'
  },
  note: {
    type: String,
    default: '',
    description: 'Match notes/remarks'
  },
  
  // Home team scores array [score, ht_score, red_cards, yellow_cards, corners, ot_score, penalty_score]
  home_scores: [{
    type: Number,
    default: null
  }],
  
  // Away team scores array [score, ht_score, red_cards, yellow_cards, corners, ot_score, penalty_score]
  away_scores: [{
    type: Number, 
    default: null
  }],
  
  // Team positions/rankings
  home_position: {
    type: String,
    default: '',
    description: 'Home team ranking position'
  },
  away_position: {
    type: String,
    default: '',
    description: 'Away team ranking position'
  },
  
  // Coverage information
  coverage: {
    mlive: {
      type: Number,
      default: 0,
      description: 'Has animation (1=yes, 0=no)'
    },
    lineup: {
      type: Number,
      default: 0,
      description: 'Has lineup (1=yes, 0=no)'
    }
  },
  
  // Round/Stage information
  round: {
    stage_id: {
      type: String,
      default: '',
      description: 'Stage ID'
    },
    group_num: {
      type: Number,
      default: null,
      description: 'Group number (1=A, 2=B, etc.)'
    },
    round_num: {
      type: Number,
      default: null,
      description: 'Round number'
    }
  },
  
  // Double round information (optional)
  related_id: {
    type: String,
    default: '',
    description: 'Related match ID for double rounds'
  },
  
  // Aggregate score for double rounds [home_total, away_total]
  agg_score: [{
    type: Number,
    default: null
  }],
  
  // Match environment (optional)
  environment: {
    weather: {
      type: Number,
      default: null,
      description: 'Weather ID (1-13)'
    },
    pressure: {
      type: String,
      default: '',
      description: 'Air pressure'
    },
    temperature: {
      type: String,
      default: '',
      description: 'Temperature'
    },
    wind: {
      type: String,
      default: '',
      description: 'Wind speed'
    },
    humidity: {
      type: String,
      default: '',
      description: 'Humidity'
    }
  },
  
  // Match flags
  tbd: {
    type: Number,
    default: 0,
    description: 'Time to be determined (1=Yes)'
  },
  has_ot: {
    type: Number,
    default: 0,
    description: 'Has overtime (1=Yes)'
  },
  ended: {
    type: Number,
    default: null,
    description: 'End time timestamp'
  },
  team_reverse: {
    type: Number,
    default: 0,
    description: 'Teams positions reversed (1=Yes)'
  },
  
  // API update timestamp
  updated_at: {
    type: Number,
    required: true,
    description: 'Update time from API'
  },
  
  // Local metadata
  data_source: {
    type: String,
    default: 'TheSports API Recent',
    description: 'Source of the data'
  },
  
  created_at: {
    type: Date,
    default: Date.now,
    description: 'Record creation time'
  }
}, {
  // Collection settings
  collection: 'matches',
  
  // Automatic version key
  versionKey: false,
  
  // Automatic timestamps
  timestamps: false, // We handle timestamps manually
  
  // Optimistic concurrency - disabled to avoid versionKey requirement
  optimisticConcurrency: false
});

// Indexes for performance optimization
matchSchema.index({ match_id: 1 }, { unique: true });
matchSchema.index({ competition_id: 1, season_id: 1 });
matchSchema.index({ home_team_id: 1, match_time: -1 });
matchSchema.index({ away_team_id: 1, match_time: -1 });
matchSchema.index({ match_time: -1 }); // For sorting by time
matchSchema.index({ status_id: 1, match_time: -1 }); // For filtering by status
matchSchema.index({ season_id: 1, status_id: 1 }); // For season-based queries

// Virtual for match datetime in readable format
matchSchema.virtual('match_datetime').get(function() {
  if (!this.match_time) return null;
  
  const date = new Date(this.match_time * 1000);
  return date.toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
});

// Virtual for checking if match involves a specific team
matchSchema.methods.involvesTeam = function(teamId) {
  return this.home_team_id === teamId || this.away_team_id === teamId;
};

// Virtual for getting team result from team perspective  
matchSchema.methods.getResultForTeam = function(teamId) {
  if (!this.involvesTeam(teamId) || this.status_id !== 3) {
    return null; // Team not involved or match not finished
  }
  
  // Get scores from home_scores and away_scores arrays (index 0 = regular time score)
  const homeScore = this.home_scores && this.home_scores[0] !== undefined ? this.home_scores[0] : null;
  const awayScore = this.away_scores && this.away_scores[0] !== undefined ? this.away_scores[0] : null;
  
  if (homeScore === null || awayScore === null) {
    return null; // No score available
  }
  
  const isHome = this.home_team_id === teamId;
  
  if (homeScore > awayScore) {
    return isHome ? 'W' : 'L';
  } else if (homeScore < awayScore) {
    return isHome ? 'L' : 'W';  
  } else {
    return 'D';
  }
};

// Static method to get team's recent matches
matchSchema.statics.getTeamRecentMatches = function(teamId, limit = 5, options = {}) {
  const query = {
    $or: [
      { home_team_id: teamId },
      { away_team_id: teamId }
    ],
    status_id: 3 // Only finished matches (status 3 = finished)
  };
  
  // Add optional filters
  if (options.seasonId) {
    query.season_id = options.seasonId;
  }
  
  if (options.compId) {
    query.competition_id = options.compId;
  }
  
  return this.find(query)
    .sort({ match_time: -1 })
    .limit(limit)
    .lean();
};

// Export the model
module.exports = mongoose.model('Match', matchSchema);