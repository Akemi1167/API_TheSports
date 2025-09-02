const mongoose = require('mongoose');

// Schema cho thông tin trận đấu (được sử dụng chung cho info, history, future)
const MatchInfoSchema = new mongoose.Schema({
  match_id: {
    type: String,
    required: true,
    description: "ID trận đấu"
  },
  competition_id: {
    type: String,
    required: true,
    description: "ID giải đấu"
  },
  match_status: {
    type: Number,
    required: true,
    description: "Trạng thái trận đấu (theo Match Status Code)"
  },
  match_time: {
    type: Number,
    required: true,
    description: "Thời gian trận đấu (timestamp)"
  },
  kickoff_timestamp: {
    type: Number,
    default: 0,
    description: "Thời gian bắt đầu hiệp 1/2 (timestamp)"
  },
  home_team: {
    team_id: {
      type: String,
      required: true,
      description: "ID đội nhà"
    },
    league_ranking: {
      type: String,
      default: "",
      description: "Thứ hạng đội nhà trong giải"
    },
    regular_score: {
      type: Number,
      default: 0,
      description: "Tỷ số chính thức đội nhà"
    },
    halftime_score: {
      type: Number,
      default: 0,
      description: "Tỷ số hiệp 1 đội nhà"
    },
    red_cards: {
      type: Number,
      default: 0,
      description: "Số thẻ đỏ đội nhà"
    },
    yellow_cards: {
      type: Number,
      default: 0,
      description: "Số thẻ vàng đội nhà"
    },
    corners: {
      type: Number,
      default: -1,
      description: "Số phạt góc đội nhà (-1 = không có dữ liệu)"
    },
    overtime_score: {
      type: Number,
      default: 0,
      description: "Tỷ số hiệp phụ đội nhà (120 phút)"
    },
    penalty_score: {
      type: Number,
      default: 0,
      description: "Tỷ số đá luân lưu đội nhà"
    }
  },
  away_team: {
    team_id: {
      type: String,
      required: true,
      description: "ID đội khách"
    },
    league_ranking: {
      type: String,
      default: "",
      description: "Thứ hạng đội khách trong giải"
    },
    regular_score: {
      type: Number,
      default: 0,
      description: "Tỷ số chính thức đội khách"
    },
    halftime_score: {
      type: Number,
      default: 0,
      description: "Tỷ số hiệp 1 đội khách"
    },
    red_cards: {
      type: Number,
      default: 0,
      description: "Số thẻ đỏ đội khách"
    },
    yellow_cards: {
      type: Number,
      default: 0,
      description: "Số thẻ vàng đội khách"
    },
    corners: {
      type: Number,
      default: -1,
      description: "Số phạt góc đội khách (-1 = không có dữ liệu)"
    },
    overtime_score: {
      type: Number,
      default: 0,
      description: "Tỷ số hiệp phụ đội khách (120 phút)"
    },
    penalty_score: {
      type: Number,
      default: 0,
      description: "Tỷ số đá luân lưu đội khách"
    }
  },
  odds: {
    asian_handicap: {
      type: String,
      default: "",
      description: "Kèo châu Á: thắng nhà,handicap,thắng khách,đóng cửa"
    },
    european_odds: {
      type: String,
      default: "",
      description: "Kèo châu Âu: thắng,hòa,thua,đóng cửa"
    },
    over_under: {
      type: String,
      default: "",
      description: "Kèo tài xỉu: tài,handicap,xỉu,đóng cửa"
    },
    corner_odds: {
      type: String,
      default: "",
      description: "Kèo phạt góc: nhiều,handicap,ít,đóng cửa"
    }
  },
  match_details: {
    description: {
      type: String,
      default: "",
      description: "Mô tả trận đấu"
    },
    is_neutral: {
      type: Number,
      default: 0,
      description: "Sân trung lập (1=có, 0=không)"
    },
    round: {
      type: Number,
      default: 0,
      description: "Vòng đấu"
    }
  },
  season_info: {
    season_id: {
      type: String,
      required: true,
      description: "ID mùa giải"
    },
    season_year: {
      type: String,
      required: true,
      description: "Năm mùa giải"
    }
  }
}, { _id: false });

// Schema cho phân bố bàn thắng theo khung thời gian
const GoalDistributionSegmentSchema = new mongoose.Schema({
  number: {
    type: Number,
    default: 0,
    description: "Số bàn thắng"
  },
  percentage: {
    type: Number,
    default: 0,
    description: "Tỷ lệ phần trăm"
  },
  start_time: {
    type: Number,
    required: true,
    description: "Thời gian bắt đầu (phút)"
  },
  end_time: {
    type: Number,
    required: true,
    description: "Thời gian kết thúc (phút)"
  }
}, { _id: false });

// Schema cho thống kê phân bố bàn thắng của một đội
const TeamGoalDistributionSchema = new mongoose.Schema({
  all: {
    matches: {
      type: Number,
      default: 0,
      description: "Tổng số trận"
    },
    scored: [{
      type: GoalDistributionSegmentSchema,
      description: "Phân bố bàn thắng ghi được (tất cả trận)"
    }],
    conceded: [{
      type: GoalDistributionSegmentSchema,
      description: "Phân bố bàn thắng thủng lưới (tất cả trận)"
    }]
  },
  home: {
    matches: {
      type: Number,
      default: 0,
      description: "Số trận sân nhà"
    },
    scored: [{
      type: GoalDistributionSegmentSchema,
      description: "Phân bố bàn thắng ghi được (sân nhà)"
    }],
    conceded: [{
      type: GoalDistributionSegmentSchema,
      description: "Phân bố bàn thắng thủng lưới (sân nhà)"
    }]
  },
  away: {
    matches: {
      type: Number,
      default: 0,
      description: "Số trận sân khách"
    },
    scored: [{
      type: GoalDistributionSegmentSchema,
      description: "Phân bố bàn thắng ghi được (sân khách)"
    }],
    conceded: [{
      type: GoalDistributionSegmentSchema,
      description: "Phân bố bàn thắng thủng lưới (sân khách)"
    }]
  }
}, { _id: false });

// Schema chính cho Head-to-Head
const HeadToHeadSchema = new mongoose.Schema({
  h2h_id: {
    type: String,
    required: true,
    unique: true,
    description: "ID duy nhất cho thống kê đối đầu (tạo từ home_team_id + away_team_id)"
  },
  home_team_id: {
    type: String,
    required: true,
    ref: 'Team',
    description: "ID đội nhà"
  },
  away_team_id: {
    type: String,
    required: true,
    ref: 'Team',
    description: "ID đội khách"
  },
  
  // Thông tin trận đấu chính
  info: {
    type: MatchInfoSchema,
    description: "Thông tin trận đấu chính"
  },
  
  // Lịch sử đối đầu và thành tích gần đây
  history: {
    vs: [{
      type: MatchInfoSchema,
      description: "Lịch sử đối đầu giữa 2 đội"
    }],
    home: [{
      type: MatchInfoSchema,
      description: "Thành tích gần đây của đội nhà"
    }],
    away: [{
      type: MatchInfoSchema,
      description: "Thành tích gần đây của đội khách"
    }]
  },
  
  // Trận đấu tương lai
  future: {
    home: [{
      type: MatchInfoSchema,
      description: "Lịch thi đấu sắp tới của đội nhà"
    }],
    away: [{
      type: MatchInfoSchema,
      description: "Lịch thi đấu sắp tới của đội khách"
    }]
  },
  
  // Phân bố bàn thắng
  goal_distribution: {
    home: {
      type: TeamGoalDistributionSchema,
      description: "Phân bố bàn thắng của đội nhà"
    },
    away: {
      type: TeamGoalDistributionSchema,
      description: "Phân bố bàn thắng của đội khách"
    }
  },
  
  // Metadata
  last_updated: {
    type: Number,
    default: () => Math.floor(Date.now() / 1000),
    description: "Thời gian cập nhật cuối (timestamp)"
  },
  data_source: {
    type: String,
    default: 'thesports_api',
    description: "Nguồn dữ liệu"
  }
}, {
  timestamps: true,
  collection: 'head_to_head'
});

// Indexes để tối ưu hóa truy vấn
HeadToHeadSchema.index({ h2h_id: 1 }, { unique: true });
HeadToHeadSchema.index({ home_team_id: 1, away_team_id: 1 });
HeadToHeadSchema.index({ home_team_id: 1 });
HeadToHeadSchema.index({ away_team_id: 1 });
HeadToHeadSchema.index({ last_updated: -1 });
HeadToHeadSchema.index({ 'info.match_time': -1 });

// Pre-save middleware để tự động cập nhật timestamp
HeadToHeadSchema.pre('save', function(next) {
  this.last_updated = Math.floor(Date.now() / 1000);
  next();
});

// Static methods
HeadToHeadSchema.statics.generateH2HId = function(homeTeamId, awayTeamId) {
  // Tạo ID duy nhất từ 2 team ID, sắp xếp để đảm bảo tính nhất quán
  const sortedIds = [homeTeamId, awayTeamId].sort();
  return `${sortedIds[0]}_vs_${sortedIds[1]}`;
};

HeadToHeadSchema.statics.parseMatchInfoFromArray = function(matchArray) {
  if (!Array.isArray(matchArray) || matchArray.length < 10) {
    throw new Error('Invalid match data array format');
  }
  
  return {
    match_id: matchArray[0],
    competition_id: matchArray[1],
    match_status: matchArray[2],
    match_time: matchArray[3],
    kickoff_timestamp: matchArray[4] || 0,
    home_team: {
      team_id: matchArray[5][0],
      league_ranking: matchArray[5][1] || "",
      regular_score: matchArray[5][2] || 0,
      halftime_score: matchArray[5][3] || 0,
      red_cards: matchArray[5][4] || 0,
      yellow_cards: matchArray[5][5] || 0,
      corners: matchArray[5][6] || -1,
      overtime_score: matchArray[5][7] || 0,
      penalty_score: matchArray[5][8] || 0
    },
    away_team: {
      team_id: matchArray[6][0],
      league_ranking: matchArray[6][1] || "",
      regular_score: matchArray[6][2] || 0,
      halftime_score: matchArray[6][3] || 0,
      red_cards: matchArray[6][4] || 0,
      yellow_cards: matchArray[6][5] || 0,
      corners: matchArray[6][6] || -1,
      overtime_score: matchArray[6][7] || 0,
      penalty_score: matchArray[6][8] || 0
    },
    odds: {
      asian_handicap: matchArray[7][0] || "",
      european_odds: matchArray[7][1] || "",
      over_under: matchArray[7][2] || "",
      corner_odds: matchArray[7][3] || ""
    },
    match_details: {
      description: matchArray[8][0] || "",
      is_neutral: matchArray[8][1] || 0,
      round: matchArray[8][2] || 0
    },
    season_info: {
      season_id: matchArray[9][0],
      season_year: matchArray[9][1]
    }
  };
};

module.exports = mongoose.model('HeadToHead', HeadToHeadSchema);
