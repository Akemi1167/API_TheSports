const express = require('express');
const router = express.Router();
const { getAllCountries, getCountryById } = require('../controllers/countryController');
const { syncCountries } = require('../cron/countryCron');

/**
 * @swagger
 * /api/countries:
 *   get:
 *     summary: Get all countries
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: List of all countries
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
 *                     $ref: '#/components/schemas/Country'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', getAllCountries);

/**
 * @swagger
 * /api/countries/{id}:
 *   get:
 *     summary: Get country by ID
 *     tags: [Countries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Country ID
 *     responses:
 *       200:
 *         description: Country details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   $ref: '#/components/schemas/Country'
 *       404:
 *         description: Country not found
 *       500:
 *         description: Server error
 */
router.get('/:id', getCountryById);

/**
 * @swagger
 * /api/countries/sync:
 *   post:
 *     summary: Manually trigger country synchronization
 *     tags: [Countries]
 *     responses:
 *       200:
 *         description: Country sync completed successfully
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
 *                   example: Country sync completed successfully
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
 *                   example: Country sync failed
 *                 error:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.post('/sync', async (req, res) => {
  try {
    console.log('🔧 Manual country sync triggered');
    await syncCountries();
    res.json({ 
      success: true, 
      message: 'Country sync completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Manual country sync failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Country sync failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
