const express = require('express');
const router = express.Router();
const matchScoreService = require('../services/matchScoreService');

/**
 * @swagger
 * components:
 *   schemas:
 *     LiveScore:
 *       type: object
 *       properties:
 *         home:
 *           type: integer
 *           description: Tỷ số đội nhà
 *         away:
 *           type: integer
 *           description: Tỷ số đội khách
 *         status:
 *           type: string
 *           description: Trạng thái trận đấu
 *         status_description:
 *           type: string
 *           description: Mô tả trạng thái
 *         is_live:
 *           type: boolean
 *           description: Trận đấu có đang live không
 *         last_updated:
 *           type: integer
 *           description: Thời gian cập nhật cuối
 *         halftime:
 *           type: object
 *           properties:
 *             home:
 *               type: integer
 *             away:
 *               type: integer
 *         additional_info:
 *           type: object
 *           properties:
 *             home_red_cards:
 *               type: integer
 *             away_red_cards:
 *               type: integer
 *             home_yellow_cards:
 *               type: integer
 *             away_yellow_cards:
 *               type: integer
 *             home_corners:
 *               type: integer
 *             away_corners:
 *               type: integer
 */

/**
 * @swagger
 * /api/live-scores:
 *   get:
 *     summary: Lấy tất cả tỷ số live hiện tại
 *     tags: [Live Scores]
 *     responses:
 *       200:
 *         description: Danh sách tỷ số live
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
 *                     type: object
 *                     properties:
 *                       match_id:
 *                         type: string
 *                       live_score:
 *                         $ref: '#/components/schemas/LiveScore'
 */
router.get('/', async (req, res) => {
  try {
    const liveMatches = await matchScoreService.getLiveMatches();
    
    res.json({
      success: true,
      total: liveMatches.length,
      data: liveMatches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/live-scores/match/{match_id}:
 *   get:
 *     summary: Lấy tỷ số live của một trận đấu
 *     tags: [Live Scores]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID trận đấu
 *     responses:
 *       200:
 *         description: Tỷ số live của trận đấu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 match_id:
 *                   type: string
 *                 live_score:
 *                   $ref: '#/components/schemas/LiveScore'
 *       404:
 *         description: Không tìm thấy trận đấu
 */
router.get('/match/:match_id', async (req, res) => {
  try {
    const { match_id } = req.params;
    
    const scores = await matchScoreService.getCurrentScores([match_id]);
    
    if (!scores[match_id]) {
      return res.status(404).json({
        success: false,
        error: 'Match not found or no live data available'
      });
    }
    
    res.json({
      success: true,
      match_id: match_id,
      live_score: scores[match_id]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/live-scores/matches:
 *   post:
 *     summary: Lấy tỷ số live của nhiều trận đấu
 *     tags: [Live Scores]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               match_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Mảng ID các trận đấu
 *     responses:
 *       200:
 *         description: Tỷ số live của các trận đấu
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
 *                   additionalProperties:
 *                     $ref: '#/components/schemas/LiveScore'
 */
router.post('/matches', async (req, res) => {
  try {
    const { match_ids } = req.body;
    
    if (!Array.isArray(match_ids)) {
      return res.status(400).json({
        success: false,
        error: 'match_ids must be an array'
      });
    }
    
    const scores = await matchScoreService.getCurrentScores(match_ids);
    
    res.json({
      success: true,
      total: Object.keys(scores).length,
      data: scores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
