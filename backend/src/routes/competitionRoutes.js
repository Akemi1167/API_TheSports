const express = require('express');
const router = express.Router();
const { getAllCompetitions, getCompetitionById } = require('../controllers/competitionController');

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

module.exports = router;
