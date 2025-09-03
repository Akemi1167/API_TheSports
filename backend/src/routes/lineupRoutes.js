const express = require('express');
const router = express.Router();
const lineupController = require('../controllers/lineupController');

/**
 * @swagger
 * components:
 *   schemas:
 *     PlayerIncident:
 *       type: object
 *       properties:
 *         type:
 *           type: integer
 *           description: Incident type (see technical statistics)
 *         time:
 *           type: string
 *           description: Incident time (e.g., "45+2")
 *         minute:
 *           type: integer
 *           description: Match minute
 *         addtime:
 *           type: integer
 *           description: Additional time
 *         belong:
 *           type: integer
 *           description: Team involved (0=neutral, 1=home, 2=away)
 *         home_score:
 *           type: integer
 *           description: Home score when incident occurred
 *         away_score:
 *           type: integer
 *           description: Away score when incident occurred
 *         player:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *         assist1:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *         assist2:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *         in_player:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 *         out_player:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             name:
 *               type: string
 * 
 *     PlayerLineup:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Player ID
 *         first:
 *           type: integer
 *           description: Starting player (1=Yes, 0=No)
 *         captain:
 *           type: integer
 *           description: Team captain (1=Yes, 0=No)
 *         name:
 *           type: string
 *           description: Player name
 *         logo:
 *           type: string
 *           description: Player photo URL
 *         shirt_number:
 *           type: integer
 *           description: Jersey number
 *         position:
 *           type: string
 *           description: Position (F=forward, M=midfielder, D=defender, G=goalkeeper)
 *         x:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: X coordinate
 *         y:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           description: Y coordinate
 *         rating:
 *           type: string
 *           description: Player rating (max 10.0)
 *         incidents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PlayerIncident'
 * 
 *     InjuryData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Player ID
 *         name:
 *           type: string
 *           description: Player name
 *         position:
 *           type: string
 *           description: Player position
 *         logo:
 *           type: string
 *           description: Player photo URL
 *         type:
 *           type: integer
 *           description: Injury type (0=unknown, 1=injured, 2=suspended)
 *         reason:
 *           type: string
 *           description: Injury/suspension reason
 *         start_time:
 *           type: integer
 *           description: Start timestamp
 *         end_time:
 *           type: integer
 *           description: End timestamp
 *         missed_matches:
 *           type: integer
 *           description: Number of matches affected
 * 
 *     Lineup:
 *       type: object
 *       properties:
 *         match_id:
 *           type: string
 *           description: Match ID
 *         confirmed:
 *           type: integer
 *           description: Official lineup confirmed (1=yes, 0=no)
 *         home_formation:
 *           type: string
 *           description: Home team formation
 *         away_formation:
 *           type: string
 *           description: Away team formation
 *         coach_id:
 *           type: object
 *           properties:
 *             home:
 *               type: string
 *               description: Home team coach ID
 *             away:
 *               type: string
 *               description: Away team coach ID
 *         lineup:
 *           type: object
 *           properties:
 *             home:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlayerLineup'
 *             away:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PlayerLineup'
 *         injury:
 *           type: object
 *           properties:
 *             home:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InjuryData'
 *             away:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InjuryData'
 *         last_updated:
 *           type: integer
 *           description: Last update timestamp
 *         data_source:
 *           type: string
 *           description: Data source
 */

/**
 * @swagger
 * /api/lineups/match/{match_id}:
 *   get:
 *     summary: Lấy lineup đầy đủ theo match ID
 *     tags: [Lineups]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID trận đấu
 *     responses:
 *       200:
 *         description: Lineup đầy đủ của trận đấu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Lineup'
 *       404:
 *         description: Không tìm thấy lineup
 */
router.get('/match/:match_id', lineupController.getLineupByMatchId);

/**
 * @swagger
 * /api/lineups/match/{match_id}/starting-eleven:
 *   get:
 *     summary: Lấy đội hình xuất phát
 *     tags: [Lineups]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID trận đấu
 *       - in: query
 *         name: team
 *         schema:
 *           type: string
 *           enum: [home, away, both]
 *           default: both
 *         description: Đội (home=nhà, away=khách, both=cả hai)
 *     responses:
 *       200:
 *         description: Đội hình xuất phát
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
 *                     match_id:
 *                       type: string
 *                     confirmed:
 *                       type: integer
 *                     formation:
 *                       type: object
 *                       properties:
 *                         home:
 *                           type: string
 *                         away:
 *                           type: string
 *                     starting_eleven:
 *                       type: object
 *                       properties:
 *                         home:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/PlayerLineup'
 *                         away:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/PlayerLineup'
 */
router.get('/match/:match_id/starting-eleven', lineupController.getStartingEleven);

/**
 * @swagger
 * /api/lineups/match/{match_id}/substitutes:
 *   get:
 *     summary: Lấy danh sách cầu thủ dự bị
 *     tags: [Lineups]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID trận đấu
 *       - in: query
 *         name: team
 *         schema:
 *           type: string
 *           enum: [home, away, both]
 *           default: both
 *         description: Đội (home=nhà, away=khách, both=cả hai)
 *     responses:
 *       200:
 *         description: Danh sách cầu thủ dự bị
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
 *                     match_id:
 *                       type: string
 *                     substitutes:
 *                       type: object
 *                       properties:
 *                         home:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/PlayerLineup'
 *                         away:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/PlayerLineup'
 */
router.get('/match/:match_id/substitutes', lineupController.getSubstitutes);

/**
 * @swagger
 * /api/lineups/match/{match_id}/player/{player_id}:
 *   get:
 *     summary: Lấy thông tin cầu thủ trong lineup
 *     tags: [Lineups]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID trận đấu
 *       - in: path
 *         name: player_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID cầu thủ
 *     responses:
 *       200:
 *         description: Thông tin cầu thủ trong lineup
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
 *                     match_id:
 *                       type: string
 *                     team:
 *                       type: string
 *                     player:
 *                       $ref: '#/components/schemas/PlayerLineup'
 */
router.get('/match/:match_id/player/:player_id', lineupController.getPlayerInLineup);

/**
 * @swagger
 * /api/lineups/match/{match_id}/incidents:
 *   get:
 *     summary: Lấy tất cả sự kiện của trận đấu
 *     tags: [Lineups]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID trận đấu
 *     responses:
 *       200:
 *         description: Tất cả sự kiện của trận đấu
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
 *                     match_id:
 *                       type: string
 *                     total_incidents:
 *                       type: integer
 *                     incidents:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/PlayerIncident'
 *                           - type: object
 *                             properties:
 *                               player_team:
 *                                 type: string
 *                               player_info:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   name:
 *                                     type: string
 *                                   shirt_number:
 *                                     type: integer
 *                                   position:
 *                                     type: string
 */
router.get('/match/:match_id/incidents', lineupController.getMatchIncidents);

/**
 * @swagger
 * /api/lineups/match/{match_id}/player/{player_id}/incidents:
 *   get:
 *     summary: Lấy sự kiện của một cầu thủ
 *     tags: [Lineups]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID trận đấu
 *       - in: path
 *         name: player_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID cầu thủ
 *     responses:
 *       200:
 *         description: Sự kiện của cầu thủ
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
 *                     match_id:
 *                       type: string
 *                     player_id:
 *                       type: string
 *                     player_name:
 *                       type: string
 *                     team:
 *                       type: string
 *                     total_incidents:
 *                       type: integer
 *                     incidents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PlayerIncident'
 */
router.get('/match/:match_id/player/:player_id/incidents', lineupController.getPlayerIncidents);

/**
 * @swagger
 * /api/lineups/match/{match_id}/injuries:
 *   get:
 *     summary: Lấy thông tin chấn thương/treo giò
 *     tags: [Lineups]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID trận đấu
 *     responses:
 *       200:
 *         description: Thông tin chấn thương/treo giò
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
 *                     match_id:
 *                       type: string
 *                     injury:
 *                       type: object
 *                       properties:
 *                         home:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/InjuryData'
 *                         away:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/InjuryData'
 */
router.get('/match/:match_id/injuries', lineupController.getInjuryData);

/**
 * @swagger
 * /api/lineups/match/{match_id}/captains:
 *   get:
 *     summary: Lấy thông tin đội trưởng
 *     tags: [Lineups]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID trận đấu
 *     responses:
 *       200:
 *         description: Thông tin đội trưởng
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
 *                     match_id:
 *                       type: string
 *                     captains:
 *                       type: object
 *                       properties:
 *                         home:
 *                           $ref: '#/components/schemas/PlayerLineup'
 *                         away:
 *                           $ref: '#/components/schemas/PlayerLineup'
 */
router.get('/match/:match_id/captains', lineupController.getCaptains);

/**
 * @swagger
 * /api/lineups/match/{match_id}/formation-analysis:
 *   get:
 *     summary: Phân tích formation và thống kê
 *     tags: [Lineups]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID trận đấu
 *     responses:
 *       200:
 *         description: Phân tích formation
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
 *                     match_id:
 *                       type: string
 *                     analysis:
 *                       type: object
 *                       properties:
 *                         home:
 *                           type: object
 *                           properties:
 *                             formation:
 *                               type: string
 *                             players_by_position:
 *                               type: object
 *                             starting_eleven_count:
 *                               type: integer
 *                             substitutes_count:
 *                               type: integer
 *                         away:
 *                           type: object
 *                           properties:
 *                             formation:
 *                               type: string
 *                             players_by_position:
 *                               type: object
 *                             starting_eleven_count:
 *                               type: integer
 *                             substitutes_count:
 *                               type: integer
 */
router.get('/match/:match_id/formation-analysis', lineupController.getFormationAnalysis);

/**
 * @swagger
 * /api/lineups/coach/{coach_id}:
 *   get:
 *     summary: Lấy tất cả lineup theo coach ID
 *     tags: [Lineups]
 *     parameters:
 *       - in: path
 *         name: coach_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID huấn luyện viên
 *     responses:
 *       200:
 *         description: Danh sách lineup của coach
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lineup'
 */
router.get('/coach/:coach_id', lineupController.getLineupsByCoach);

/**
 * @swagger
 * /api/lineups/player/{player_id}:
 *   get:
 *     summary: Lấy tất cả lineup theo player ID
 *     tags: [Lineups]
 *     parameters:
 *       - in: path
 *         name: player_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID cầu thủ
 *     responses:
 *       200:
 *         description: Danh sách lineup của cầu thủ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lineup'
 */
router.get('/player/:player_id', lineupController.getLineupsByPlayer);

/**
 * @swagger
 * /api/lineups/sync:
 *   post:
 *     summary: Đồng bộ dữ liệu lineup từ API (thủ công)
 *     tags: [Lineups]
 *     responses:
 *       200:
 *         description: Đồng bộ thành công
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
 */
router.post('/sync', lineupController.syncLineupData);

module.exports = router;
