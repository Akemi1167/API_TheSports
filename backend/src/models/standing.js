const mongoose = require('mongoose');

// Schema cho thông tin thăng hạng/xuống hạng
const PromotionSchema = new mongoose.Schema({
  id: { type: String, required: true, description: 'Up/down id' },
  name: { type: String, required: false, default: '', description: 'Up/down competition name' },
  color: { type: String, required: false, default: '', description: 'Color value' }
}, { _id: false });

// Schema cho thông tin đội trong bảng xếp hạng
const TeamRowSchema = new mongoose.Schema({
  team_id: { type: String, required: true, description: 'Team id' },
  promotion_id: { type: String, required: false, default: '', description: 'Up/down id' },
  points: { type: Number, required: false, default: 0, description: 'Points' },
  position: { type: Number, required: false, default: 0, description: 'Rank' },
  deduct_points: { type: Number, required: false, default: 0, description: 'Deduct points' },
  note: { type: String, required: false, default: '', description: 'Description' },
  
  // Thống kê tổng
  total: { type: Number, required: false, default: 0, description: 'Total matches' },
  won: { type: Number, required: false, default: 0, description: 'Number of wins' },
  draw: { type: Number, required: false, default: 0, description: 'Number of draws' },
  loss: { type: Number, required: false, default: 0, description: 'Number of losses' },
  goals: { type: Number, required: false, default: 0, description: 'Goals scored' },
  goals_against: { type: Number, required: false, default: 0, description: 'Goals conceded' },
  goal_diff: { type: Number, required: false, default: 0, description: 'Goal difference' },
  
  // Thống kê sân nhà
  home_points: { type: Number, required: false, default: 0, description: 'Home points' },
  home_position: { type: Number, required: false, default: 0, description: 'Home ranking' },
  home_total: { type: Number, required: false, default: 0, description: 'Home matches' },
  home_won: { type: Number, required: false, default: 0, description: 'Home wins' },
  home_draw: { type: Number, required: false, default: 0, description: 'Home draws' },
  home_loss: { type: Number, required: false, default: 0, description: 'Home losses' },
  home_goals: { type: Number, required: false, default: 0, description: 'Home goals' },
  home_goals_against: { type: Number, required: false, default: 0, description: 'Home goals conceded' },
  home_goal_diff: { type: Number, required: false, default: 0, description: 'Home goal difference' },
  
  // Thống kê sân khách
  away_points: { type: Number, required: false, default: 0, description: 'Away points' },
  away_position: { type: Number, required: false, default: 0, description: 'Away ranking' },
  away_total: { type: Number, required: false, default: 0, description: 'Away matches' },
  away_won: { type: Number, required: false, default: 0, description: 'Away wins' },
  away_draw: { type: Number, required: false, default: 0, description: 'Away draws' },
  away_loss: { type: Number, required: false, default: 0, description: 'Away losses' },
  away_goals: { type: Number, required: false, default: 0, description: 'Away goals' },
  away_goals_against: { type: Number, required: false, default: 0, description: 'Away goals conceded' },
  away_goal_diff: { type: Number, required: false, default: 0, description: 'Away goal difference' },
  
  updated_at: { type: Number, required: false, default: () => Date.now(), description: 'Update time' }
}, { _id: false });

// Schema cho bảng xếp hạng
const StandingTableSchema = new mongoose.Schema({
  id: { type: String, required: true, description: 'Standing table id' },
  conference: { type: String, required: false, default: '', description: 'Zoning information (only available in very few competitions, such as the US League)' },
  group: { type: Number, required: false, default: 0, description: 'Not 0 means the group of the group match, 1-A, 2-B and so on' },
  stage_id: { type: String, required: false, default: '', description: 'Stage id' },
  rows: [TeamRowSchema] // Danh sách các đội trong bảng xếp hạng
}, { _id: false });

// Schema chính cho xếp hạng giải đấu
const StandingSchema = new mongoose.Schema({
  season_id: { type: String, required: true, unique: true, description: 'Season id' },
  promotions: [PromotionSchema], // Danh sách thông tin thăng hạng/xuống hạng
  tables: [StandingTableSchema], // Danh sách bảng xếp hạng
  updated_at: { type: Number, required: false, default: () => Date.now(), description: 'Update time' },
  created_at: { type: Date, default: Date.now },
  data_source: { type: String, required: false, default: 'TheSports API', description: 'Nguồn dữ liệu' }
});

// Index để tối ưu hóa truy vấn
StandingSchema.index({ season_id: 1 });
StandingSchema.index({ 'tables.id': 1 });
StandingSchema.index({ 'tables.stage_id': 1 });
StandingSchema.index({ 'tables.group': 1 });
StandingSchema.index({ 'tables.rows.team_id': 1 });
StandingSchema.index({ 'tables.rows.position': 1 });
StandingSchema.index({ updated_at: -1 });

// Pre-save middleware để cập nhật updated_at
StandingSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Standing', StandingSchema);
