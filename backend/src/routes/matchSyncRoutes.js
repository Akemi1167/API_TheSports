const express = require('express');
const RecentMatchService = require('../services/recentMatchService');

const router = express.Router();
const recentMatchService = new RecentMatchService();

/**
 * @swagger
 * /api/matches/sync/recent:
 *   post:
 *     summary: Trigger recent matches synchronization
 *     tags: [Matches]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               force_full:
 *                 type: boolean
 *                 description: Force full synchronization
 *               season_id:
 *                 type: string
 *                 description: Optional season ID filter
 *               comp_id:
 *                 type: string
 *                 description: Optional competition ID filter
 *     responses:
 *       200:
 *         description: Synchronization completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total_matches:
 *                       type: number
 *                     recent_updates:
 *                       type: number
 *                     last_sync_time:
 *                       type: number
 *                     sync_type:
 *                       type: string
 *       500:
 *         description: Synchronization failed
 */
router.post('/recent', async (req, res) => {
  try {
    const { force_full, season_id, comp_id } = req.body || {};
    
    console.log('🔄 Manual recent matches sync triggered');
    
    // Force full sync if requested
    if (force_full) {
      console.log('🔄 Forcing full synchronization...');
      recentMatchService.isInitialSync = true;
    }
    
    const options = {};
    if (season_id) options.season_id = season_id;
    if (comp_id) options.comp_id = comp_id;
    
    // Run synchronization
    await recentMatchService.syncRecentMatches(options);
    
    // Get updated statistics
    const stats = await recentMatchService.getSyncStats();
    
    // Reset initial sync flag if it was forced
    if (force_full) {
      recentMatchService.isInitialSync = false;
    }
    
    res.json({
      success: true,
      message: 'Recent matches synchronization completed successfully',
      stats: {
        ...stats,
        sync_type: force_full ? 'Full Sync (Forced)' : (stats.is_initial_sync ? 'Full Sync' : 'Incremental Sync')
      }
    });
    
  } catch (error) {
    console.error('❌ Manual sync failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Recent matches synchronization failed',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/matches/sync/status:
 *   get:
 *     summary: Get recent matches synchronization status
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: Sync status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total_matches:
 *                       type: number
 *                     recent_updates:
 *                       type: number
 *                     last_sync_time:
 *                       type: number
 *                     is_initial_sync:
 *                       type: boolean
 *                     last_sync_ago:
 *                       type: string
 */
router.get('/status', async (req, res) => {
  try {
    const stats = await recentMatchService.getSyncStats();
    
    // Calculate time since last sync
    let lastSyncAgo = 'Never';
    if (stats && stats.last_sync_time) {
      const nowTimestamp = Math.floor(Date.now() / 1000);
      const secondsAgo = nowTimestamp - stats.last_sync_time;
      
      if (secondsAgo < 60) {
        lastSyncAgo = `${secondsAgo} seconds ago`;
      } else if (secondsAgo < 3600) {
        lastSyncAgo = `${Math.floor(secondsAgo / 60)} minutes ago`;
      } else if (secondsAgo < 86400) {
        lastSyncAgo = `${Math.floor(secondsAgo / 3600)} hours ago`;
      } else {
        lastSyncAgo = `${Math.floor(secondsAgo / 86400)} days ago`;
      }
    }
    
    res.json({
      success: true,
      stats: {
        ...stats,
        last_sync_ago: lastSyncAgo,
        current_time: Math.floor(Date.now() / 1000)
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to get sync status:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get synchronization status',
      error: error.message
    });
  }
});

module.exports = router;