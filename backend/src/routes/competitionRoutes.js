const express = require('express');
const router = express.Router();
const { getAllCompetitions, getCompetitionById } = require('../controllers/competitionController');
const { syncCompetitions } = require('../cron/competitionCron');

/**
 * @swagger
 * /api/competitions:
 *   get:
 *     summary: Get all competitions
 *     tags: [Competitions]
 *     responses:
 *       200:
 *         description: List of all competitions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Competition'
 */
router.get('/', getAllCompetitions);

/**
 * @swagger
 * /api/competitions/{id}:
 *   get:
 *     summary: Get competition by ID
 *     tags: [Competitions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Competition ID
 *     responses:
 *       200:
 *         description: Competition details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   $ref: '#/components/schemas/Competition'
 *       404:
 *         description: Competition not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getCompetitionById);

/**
 * @swagger
 * /api/competitions/sync:
 *   post:
 *     summary: Manually trigger competition synchronization
 *     tags: [Competitions]
 *     responses:
 *       200:
 *         description: Competition sync completed successfully
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
 *                   example: Competition sync completed successfully
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Sync failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Competition sync failed
 *                 error:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.post('/sync', async (req, res) => {
  try {
    console.log('🔧 Manual competition sync triggered');
    await syncCompetitions();
    res.json({ 
      success: true, 
      message: 'Competition sync completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Manual competition sync failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Competition sync failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
