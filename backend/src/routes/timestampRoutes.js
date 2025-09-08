/**
 * API endpoints for viewing converted timestamps
 */

const express = require('express');
const router = express.Router();
const videoStreamService = require('../services/videoStreamService');
const { 
  timestampToDateTime, 
  formatMatchTime, 
  getCurrentTimestamp 
} = require('../utils/timestampUtils');

/**
 * GET /api/timestamps/video-streams
 * Get all video streams with converted timestamps
 */
router.get('/video-streams', async (req, res) => {
  try {
    const result = await videoStreamService.getAllVideoStreams();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Video streams retrieved with converted timestamps',
        count: result.data.length,
        current_time: timestampToDateTime(getCurrentTimestamp()),
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/timestamps/video-streams/live
 * Get live video streams with converted timestamps
 */
router.get('/video-streams/live', async (req, res) => {
  try {
    const result = await videoStreamService.getAllVideoStreams();
    
    if (result.success) {
      // Filter live streams
      const liveStreams = result.data.filter(stream => stream.is_live);
      
      res.json({
        success: true,
        message: 'Live video streams with converted timestamps',
        count: liveStreams.length,
        current_time: timestampToDateTime(getCurrentTimestamp()),
        data: liveStreams
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/timestamps/video-streams/upcoming
 * Get upcoming video streams with converted timestamps
 */
router.get('/video-streams/upcoming', async (req, res) => {
  try {
    const result = await videoStreamService.getAllVideoStreams();
    
    if (result.success) {
      // Filter upcoming streams
      const upcomingStreams = result.data.filter(stream => stream.is_future);
      
      res.json({
        success: true,
        message: 'Upcoming video streams with converted timestamps',
        count: upcomingStreams.length,
        current_time: timestampToDateTime(getCurrentTimestamp()),
        data: upcomingStreams
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/timestamps/video-streams/:match_id
 * Get specific video stream with converted timestamps
 */
router.get('/video-streams/:match_id', async (req, res) => {
  try {
    const { match_id } = req.params;
    const result = await videoStreamService.getVideoStreamByMatchId(match_id);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Video stream retrieved with converted timestamps',
        current_time: timestampToDateTime(getCurrentTimestamp()),
        data: result.data
      });
    } else {
      res.status(result.statusCode || 500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/timestamps/summary
 * Get timestamp conversion summary
 */
router.get('/summary', async (req, res) => {
  try {
    const result = await videoStreamService.getAllVideoStreams();
    
    if (result.success) {
      const currentTime = getCurrentTimestamp();
      const stats = {
        total: result.data.length,
        live: result.data.filter(s => s.is_live).length,
        upcoming: result.data.filter(s => s.is_future).length,
        past: result.data.filter(s => s.is_past).length,
        current_timestamp: currentTime,
        current_datetime: timestampToDateTime(currentTime)
      };
      
      res.json({
        success: true,
        message: 'Timestamp conversion summary',
        data: stats
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
