const express = require('express');
const router = express.Router();
const { getAllSeasons, getSeasonById } = require('../controllers/seasonController');

/**
 * @swagger
 * /api/seasons:
 *   get:
 *     summary: Get all seasons
 *     tags: [Seasons]
 *     responses:
 *       200:
 *         description: List of all seasons
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
 *                     $ref: '#/components/schemas/Season'
 */
router.get('/', getAllSeasons);

/**
 * @swagger
 * /api/seasons/{id}:
 *   get:
 *     summary: Get season by ID
 *     tags: [Seasons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Season ID
 *     responses:
 *       200:
 *         description: Season details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   $ref: '#/components/schemas/Season'
 *       404:
 *         description: Season not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getSeasonById);

module.exports = router;
