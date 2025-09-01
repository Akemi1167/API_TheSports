const express = require('express');
const router = express.Router();
const { getAllReferees, getRefereeById } = require('../controllers/refereeController');

/**
 * @swagger
 * /api/referees:
 *   get:
 *     summary: Get all referees
 *     tags: [Referees]
 *     responses:
 *       200:
 *         description: List of all referees
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
 *                     $ref: '#/components/schemas/Referee'
 */
router.get('/', getAllReferees);

/**
 * @swagger
 * /api/referees/{id}:
 *   get:
 *     summary: Get referee by ID
 *     tags: [Referees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Referee ID
 *     responses:
 *       200:
 *         description: Referee details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   $ref: '#/components/schemas/Referee'
 *       404:
 *         description: Referee not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getRefereeById);

module.exports = router;
