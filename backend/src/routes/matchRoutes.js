const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');

/**
 * @swagger
 * components:
 *   schemas:
 *     MatchScore:
 *       type: object
 *       properties:
 *         home_score:
 *           type: integer
 *           nullable: true
 *           description: Home team score
 *         away_score:
 *           type: integer
 *           nullable: true
 *           description: Away team score
 *         home_ht_score:
 *           type: integer
 *           nullable: true
 *           description: Home team halftime score
 *         away_ht_score:
 *           type: integer
 *           nullable: true
 *           description: Away team halftime score
 * 
 *     Match:
 *       type: object
 *       properties:
 *         match_id:
 *           type: string
 *           description: Unique match identifier
 *         comp_id:
 *           type: string
 *           description: Competition ID
 *         comp_name:
 *           type: string
 *           description: Competition name
 *         season_id:
 *           type: string
 *           description: Season ID
 *         stage_id:
 *           type: string
 *           description: Stage ID
 *         home_id:
 *           type: string
 *           description: Home team ID
 *         home_name:
 *           type: string
 *           description: Home team name
 *         away_id:
 *           type: string
 *           description: Away team ID
 *         away_name:
 *           type: string
 *           description: Away team name
 *         match_time:
 *           type: integer
 *           description: Match timestamp (Unix timestamp)
 *         match_datetime:
 *           type: string
 *           description: Formatted match datetime
 *         status:
 *           type: integer
 *           description: Match status code
 *         status_name:
 *           type: string
 *           description: Match status name
 *         scores:
 *           $ref: '#/components/schemas/MatchScore'
 *         round:
 *           type: string
 *           description: Match round/week
 *         group_name:
 *           type: string
 *           description: Group name
 *         venue_id:
 *           type: string
 *           description: Venue ID
 *         venue_name:
 *           type: string
 *           description: Venue name
 *         minute:
 *           type: integer
 *           nullable: true
 *           description: Current match minute (for live matches)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Record creation time
 *         updated_at:
 *           type: integer
 *           description: Last update time
 */

/**
 * @swagger
 * /api/matches/sync:
 *   post:
 *     summary: Đồng bộ dữ liệu matches từ external API
 *     tags: [Matches]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               season_id:
 *                 type: string
 *                 description: Season ID (optional)
 *               comp_id:
 *                 type: string
 *                 description: Competition ID (optional)
 *               limit:
 *                 type: integer
 *                 default: 1000
 *                 description: Limit number of matches to sync
 *     responses:
 *       200:
 *         description: Matches synchronization completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Matches synchronization completed successfully
 *       500:
 *         description: Synchronization failed
 */
router.post('/sync', matchController.syncMatchesData);

/**
 * @swagger
 * /api/matches/stats:
 *   get:
 *     summary: Lấy thống kê matches
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: Thống kê matches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Tổng số matches
 *                     finished:
 *                       type: integer
 *                       description: Số matches đã kết thúc
 *                     live:
 *                       type: integer
 *                       description: Số matches đang diễn ra
 *                     scheduled:
 *                       type: integer
 *                       description: Số matches được lên lịch
 *       500:
 *         description: Lỗi server
 */
router.get('/stats', matchController.getMatchStats);

/**
 * @swagger
 * /api/matches/team/{team_id}:
 *   get:
 *     summary: Lấy matches của một đội
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: team_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng matches trả về
 *       - in: query
 *         name: season_id
 *         schema:
 *           type: string
 *         description: Season ID (tùy chọn)
 *       - in: query
 *         name: comp_id
 *         schema:
 *           type: string
 *         description: Competition ID (tùy chọn)
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: Match status (tùy chọn)
 *     responses:
 *       200:
 *         description: Danh sách matches của đội
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 team_id:
 *                   type: string
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Match'
 *       404:
 *         description: Không tìm thấy matches
 *       500:
 *         description: Lỗi server
 */
router.get('/team/:team_id', matchController.getTeamMatches);

/**
 * @swagger
 * /api/matches/team/{team_id}/last5:
 *   get:
 *     summary: Lấy form Last 5 của một đội
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: team_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Team ID
 *       - in: query
 *         name: season_id
 *         schema:
 *           type: string
 *         description: Season ID (tùy chọn)
 *     responses:
 *       200:
 *         description: Form Last 5 của đội
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 team_id:
 *                   type: string
 *                 form:
 *                   type: string
 *                   description: Form string (W/L/D)
 *                   example: "WWLDW"
 *                 matches_count:
 *                   type: integer
 *                   description: Số trận đã phân tích
 *                 matches:
 *                   type: array
 *                   description: Chi tiết các trận đấu
 *       404:
 *         description: Không tìm thấy matches
 *       500:
 *         description: Lỗi server
 */
router.get('/team/:team_id/last5', matchController.getTeamLast5Form);

/**
 * @swagger
 * /api/matches/{match_id}/standings:
 *   get:
 *     summary: Lấy bảng xếp hạng từ match_id với thông tin Last 5
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Bảng xếp hạng với thông tin Last 5
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 match_info:
 *                   type: object
 *                   description: Thông tin trận đấu
 *                 standings:
 *                   type: object
 *                   description: Bảng xếp hạng với Last 5 form
 *                 match_teams:
 *                   type: object
 *                   description: Thông tin 2 đội trong trận đấu
 *                 teams_info:
 *                   type: object
 *                   description: Chi tiết thông tin đội
 *       404:
 *         description: Không tìm thấy trận đấu hoặc bảng xếp hạng
 *       500:
 *         description: Lỗi server
 */
router.get('/:match_id/standings', matchController.getStandingsFromMatch);

/**
 * @swagger
 * /api/matches/{match_id}/teams-comparison:
 *   get:
 *     summary: So sánh thứ hạng và form của 2 đội từ match_id
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       200:
 *         description: So sánh 2 đội
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 home_team:
 *                   type: object
 *                   description: Thông tin đội nhà
 *                 away_team:
 *                   type: object
 *                   description: Thông tin đội khách
 *                 position_difference:
 *                   type: integer
 *                   description: Chênh lệch thứ hạng
 *                 points_difference:
 *                   type: integer
 *                   description: Chênh lệch điểm số
 *                 higher_team:
 *                   type: string
 *                   description: Đội xếp hạng cao hơn
 *       404:
 *         description: Không tìm thấy dữ liệu
 *       500:
 *         description: Lỗi server
 */
router.get('/:match_id/teams-comparison', matchController.getTeamsComparison);

/**
 * @swagger
 * /api/matches/{match_id}/area-standings:
 *   get:
 *     summary: Lấy bảng xếp hạng xung quanh vị trí của 2 đội
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *       - in: query
 *         name: range
 *         schema:
 *           type: integer
 *           default: 3
 *         description: Số đội xung quanh để hiển thị
 *     responses:
 *       200:
 *         description: Bảng xếp hạng khu vực
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 match_info:
 *                   type: object
 *                   description: Thông tin trận đấu
 *                 table_info:
 *                   type: object
 *                   description: Thông tin bảng xếp hạng
 *                 position_range:
 *                   type: object
 *                   description: Khoảng thứ hạng hiển thị
 *                 teams:
 *                   type: array
 *                   description: Danh sách đội trong khu vực
 *                 match_teams:
 *                   type: object
 *                   description: 2 đội trong trận đấu
 *       404:
 *         description: Không tìm thấy dữ liệu
 *       500:
 *         description: Lỗi server
 */
router.get('/:match_id/area-standings', matchController.getMatchAreaStandings);

/**
 * @swagger
 * /api/matches/competition/{comp_id}:
 *   get:
 *     summary: Lấy matches theo competition
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: comp_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *       - in: query
 *         name: season_id
 *         schema:
 *           type: string
 *         description: Season ID (tùy chọn)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Số lượng matches trả về
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: Match status (tùy chọn)
 *     responses:
 *       200:
 *         description: Danh sách matches của competition
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 comp_id:
 *                   type: string
 *                 season_id:
 *                   type: string
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Match'
 *       500:
 *         description: Lỗi server
 */
router.get('/competition/:comp_id', matchController.getCompetitionMatches);

module.exports = router;