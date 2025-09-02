const express = require('express');
const router = express.Router();
const standingController = require('../controllers/standingController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Promotion:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Up/down id
 *         name:
 *           type: string
 *           description: Up/down competition name
 *           default: ""
 *         color:
 *           type: string
 *           description: Color value
 *           default: ""
 * 
 *     TeamRow:
 *       type: object
 *       properties:
 *         team_id:
 *           type: string
 *           description: Team id
 *         promotion_id:
 *           type: string
 *           description: Up/down id
 *           default: ""
 *         points:
 *           type: integer
 *           description: Points
 *           default: 0
 *         position:
 *           type: integer
 *           description: Rank
 *           default: 0
 *         deduct_points:
 *           type: integer
 *           description: Deduct points
 *           default: 0
 *         note:
 *           type: string
 *           description: Description
 *           default: ""
 *         total:
 *           type: integer
 *           description: Total matches
 *           default: 0
 *         won:
 *           type: integer
 *           description: Number of wins
 *           default: 0
 *         draw:
 *           type: integer
 *           description: Number of draws
 *           default: 0
 *         loss:
 *           type: integer
 *           description: Number of losses
 *           default: 0
 *         goals:
 *           type: integer
 *           description: Goals scored
 *           default: 0
 *         goals_against:
 *           type: integer
 *           description: Goals conceded
 *           default: 0
 *         goal_diff:
 *           type: integer
 *           description: Goal difference
 *           default: 0
 *         home_points:
 *           type: integer
 *           description: Home points
 *           default: 0
 *         home_position:
 *           type: integer
 *           description: Home ranking
 *           default: 0
 *         home_total:
 *           type: integer
 *           description: Home matches
 *           default: 0
 *         home_won:
 *           type: integer
 *           description: Home wins
 *           default: 0
 *         home_draw:
 *           type: integer
 *           description: Home draws
 *           default: 0
 *         home_loss:
 *           type: integer
 *           description: Home losses
 *           default: 0
 *         home_goals:
 *           type: integer
 *           description: Home goals
 *           default: 0
 *         home_goals_against:
 *           type: integer
 *           description: Home goals conceded
 *           default: 0
 *         home_goal_diff:
 *           type: integer
 *           description: Home goal difference
 *           default: 0
 *         away_points:
 *           type: integer
 *           description: Away points
 *           default: 0
 *         away_position:
 *           type: integer
 *           description: Away ranking
 *           default: 0
 *         away_total:
 *           type: integer
 *           description: Away matches
 *           default: 0
 *         away_won:
 *           type: integer
 *           description: Away wins
 *           default: 0
 *         away_draw:
 *           type: integer
 *           description: Away draws
 *           default: 0
 *         away_loss:
 *           type: integer
 *           description: Away losses
 *           default: 0
 *         away_goals:
 *           type: integer
 *           description: Away goals
 *           default: 0
 *         away_goals_against:
 *           type: integer
 *           description: Away goals conceded
 *           default: 0
 *         away_goal_diff:
 *           type: integer
 *           description: Away goal difference
 *           default: 0
 *         updated_at:
 *           type: integer
 *           description: Update time
 * 
 *     StandingTable:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Standing table id
 *         conference:
 *           type: string
 *           description: Zoning information (only available in very few competitions, such as the US League)
 *           default: ""
 *         group:
 *           type: integer
 *           description: Not 0 means the group of the group match, 1-A, 2-B and so on
 *           default: 0
 *         stage_id:
 *           type: string
 *           description: Stage id
 *           default: ""
 *         rows:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TeamRow'
 *           description: Team points list
 * 
 *     Standing:
 *       type: object
 *       properties:
 *         season_id:
 *           type: string
 *           description: Season id
 *         promotions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Promotion'
 *           description: Relegation competition list
 *         tables:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/StandingTable'
 *           description: Standings list
 *         updated_at:
 *           type: integer
 *           description: Update time
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Record creation time
 *         data_source:
 *           type: string
 *           description: Data source
 *           default: "TheSports API"
 */

/**
 * @swagger
 * /api/standings/sync:
 *   post:
 *     summary: Đồng bộ dữ liệu standings từ external API
 *     tags: [Standings]
 *     responses:
 *       200:
 *         description: Standings synchronization completed successfully
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
 *                   example: Standings synchronization completed successfully
 *       500:
 *         description: Synchronization failed
 */
router.post('/sync', standingController.syncStandingsData);

/**
 * @swagger
 * /api/standings/season/{season_id}:
 *   get:
 *     summary: Lấy xếp hạng theo season ID
 *     tags: [Standings]
 *     parameters:
 *       - in: path
 *         name: season_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Season ID
 *     responses:
 *       200:
 *         description: Thông tin xếp hạng của season
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Standing'
 *       404:
 *         description: Không tìm thấy xếp hạng
 *       500:
 *         description: Lỗi server
 */
router.get('/season/:season_id', standingController.getStandingBySeason);

/**
 * @swagger
 * /api/standings/stage/{stage_id}:
 *   get:
 *     summary: Lấy xếp hạng theo stage ID
 *     tags: [Standings]
 *     parameters:
 *       - in: path
 *         name: stage_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stage ID
 *     responses:
 *       200:
 *         description: Thông tin xếp hạng của stage
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Standing'
 *       404:
 *         description: Không tìm thấy xếp hạng
 *       500:
 *         description: Lỗi server
 */
router.get('/stage/:stage_id', standingController.getStandingByStage);

/**
 * @swagger
 * /api/standings/table/{table_id}:
 *   get:
 *     summary: Lấy xếp hạng theo table ID
 *     tags: [Standings]
 *     parameters:
 *       - in: path
 *         name: table_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Table ID
 *     responses:
 *       200:
 *         description: Thông tin bảng xếp hạng cụ thể
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
 *                     season_id:
 *                       type: string
 *                     promotions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Promotion'
 *                     table:
 *                       $ref: '#/components/schemas/StandingTable'
 *                     updated_at:
 *                       type: integer
 *       404:
 *         description: Không tìm thấy bảng xếp hạng
 *       500:
 *         description: Lỗi server
 */
router.get('/table/:table_id', standingController.getStandingByTable);

/**
 * @swagger
 * /api/standings/team/{team_id}:
 *   get:
 *     summary: Lấy thông tin đội trong xếp hạng
 *     tags: [Standings]
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
 *         description: Season ID (tùy chọn, nếu không có sẽ lấy tất cả season)
 *     responses:
 *       200:
 *         description: Thông tin đội trong các bảng xếp hạng
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
 *                 season_id:
 *                   type: string
 *                 total:
 *                   type: integer
 *                   description: Số lượng bảng xếp hạng tìm thấy
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       season_id:
 *                         type: string
 *                       table_id:
 *                         type: string
 *                       stage_id:
 *                         type: string
 *                       conference:
 *                         type: string
 *                       group:
 *                         type: integer
 *                       team_data:
 *                         $ref: '#/components/schemas/TeamRow'
 *                       updated_at:
 *                         type: integer
 *       404:
 *         description: Không tìm thấy thông tin đội
 *       500:
 *         description: Lỗi server
 */
router.get('/team/:team_id', standingController.getTeamStanding);

/**
 * @swagger
 * /api/standings/group/{season_id}/{group_number}:
 *   get:
 *     summary: Lấy xếp hạng theo group
 *     tags: [Standings]
 *     parameters:
 *       - in: path
 *         name: season_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Season ID
 *       - in: path
 *         name: group_number
 *         required: true
 *         schema:
 *           type: integer
 *         description: Group number (1-A, 2-B, etc.)
 *     responses:
 *       200:
 *         description: Thông tin xếp hạng của group
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
 *                     season_id:
 *                       type: string
 *                     promotions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Promotion'
 *                     tables:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/StandingTable'
 *                     updated_at:
 *                       type: integer
 *       404:
 *         description: Không tìm thấy xếp hạng group
 *       500:
 *         description: Lỗi server
 */
router.get('/group/:season_id/:group_number', standingController.getStandingByGroup);

module.exports = router;
