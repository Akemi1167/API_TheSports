const express = require('express');
const router = express.Router();
const { getAllStages, getStageById } = require('../controllers/stageController');

/**
 * @swagger
 * /api/stages:
 *   get:
 *     summary: Get all stages
 *     tags: [Stages]
 *     responses:
 *       200:
 *         description: List of all stages
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
 *                     $ref: '#/components/schemas/Stage'
 */
router.get('/', getAllStages);

/**
 * @swagger
 * /api/stages/{id}:
 *   get:
 *     summary: Get stage by ID
 *     tags: [Stages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Stage ID
 *     responses:
 *       200:
 *         description: Stage details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   $ref: '#/components/schemas/Stage'
 *       404:
 *         description: Stage not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getStageById);

module.exports = router;
