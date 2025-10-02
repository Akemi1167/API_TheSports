const express = require('express');
const router = express.Router();
const standingController = require('../controllers/standingController');

/**
 * @swagger
 * tags:
 *   name: Standings
 *   description: Standing management API
 */

/**
 * @swagger
 * /api/standings/sync:
 *   post:
 *     summary: Đồng bộ dữ liệu standings từ TheSports API
 *     tags: [Standings]
 *     responses:
 *       200:
 *         description: Synchronization completed successfully
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
 *         description: Season standings retrieved successfully
 *       500:
 *         description: Server error
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
 *         description: Stage standings retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/stage/:stage_id', standingController.getStandingByStage);
router.get('/table/:table_id', standingController.getStandingByTable);
router.get('/team/:team_id', standingController.getTeamStanding);
router.get('/group/:season_id/:group_number', standingController.getStandingByGroup);
router.get('/team/:team_id/last5', standingController.getTeamLast5Form);

/**
 * @swagger
 * /api/standings/season/{season_id}/last5:
 *   get:
 *     summary: Lấy bảng xếp hạng với Last 5 form (có match_id)
 *     tags: [Standings]
 *     parameters:
 *       - in: path
 *         name: season_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Season ID
 *       - in: query
 *         name: comp_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Số lượng đội tối đa
 *       - in: query
 *         name: sync_matches
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Sync matches trước khi lấy data
 *     responses:
 *       200:
 *         description: Last 5 form với match_id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 season_id:
 *                   type: string
 *                 comp_id:
 *                   type: string
 *                 standings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       team:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                       last5:
 *                         type: object
 *                         properties:
 *                           form:
 *                             type: string
 *                             example: "WWLWD"
 *                           points:
 *                             type: integer
 *                           recent_matches:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 match_id:
 *                                   type: string
 *                                   description: "Real match ID từ database"
 *                                 opponent:
 *                                   type: string
 *                                 result:
 *                                   type: string
 *                                   enum: [W, D, L]
 *                                 score:
 *                                   type: string
 *                                 date:
 *                                   type: string
 *                                 venue:
 *                                   type: string
 *                                 estimated:
 *                                   type: boolean
 *                                   description: "false nếu là real data, true nếu estimated"
 *       500:
 *         description: Server error
 */
router.get('/season/:season_id/last5', standingController.getSeasonLast5Form);

/**
 * @swagger
 * /api/standings/season/{season_id}/sync-matches:
 *   post:
 *     summary: Đồng bộ matches cho season cụ thể
 *     tags: [Standings]
 *     parameters:
 *       - in: path
 *         name: season_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Season ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comp_id:
 *                 type: string
 *                 description: Competition ID (optional)
 *     responses:
 *       200:
 *         description: Matches synchronized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 season_id:
 *                   type: string
 *                 synced_matches:
 *                   type: integer
 *       500:
 *         description: Synchronization failed
 */
router.post('/season/:season_id/sync-matches', standingController.syncSeasonMatches);

module.exports = router;
