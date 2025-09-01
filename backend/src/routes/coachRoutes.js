const express = require('express');
const router = express.Router();
const { getAllCoaches, getCoachById } = require('../controllers/coachController');

/**
 * @swagger
 * /api/coaches:
 *   get:
 *     summary: Get all coaches
 *     tags: [Coaches]
 *     responses:
 *       200:
 *         description: List of all coaches
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
 *                     $ref: '#/components/schemas/Coach'
 */
router.get('/', getAllCoaches);

/**
 * @swagger
 * /api/coaches/{id}:
 *   get:
 *     summary: Get coach by ID
 *     tags: [Coaches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coach ID
 *     responses:
 *       200:
 *         description: Coach details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   $ref: '#/components/schemas/Coach'
 *       404:
 *         description: Coach not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getCoachById);

module.exports = router;
