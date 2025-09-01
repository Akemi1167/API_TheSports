const express = require('express');
const router = express.Router();
const { getAllVenues, getVenueById } = require('../controllers/venueController');

/**
 * @swagger
 * /api/venues:
 *   get:
 *     summary: Get all venues
 *     tags: [Venues]
 *     responses:
 *       200:
 *         description: List of all venues
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
 *                     $ref: '#/components/schemas/Venue'
 */
router.get('/', getAllVenues);

/**
 * @swagger
 * /api/venues/{id}:
 *   get:
 *     summary: Get venue by ID
 *     tags: [Venues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Venue ID
 *     responses:
 *       200:
 *         description: Venue details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   $ref: '#/components/schemas/Venue'
 *       404:
 *         description: Venue not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getVenueById);

module.exports = router;
