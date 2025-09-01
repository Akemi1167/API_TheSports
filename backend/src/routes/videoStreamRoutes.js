const express = require('express');
const router = express.Router();
const videoStreamController = require('../controllers/videoStreamController');

/**
 * @swagger
 * components:
 *   schemas:
 *     VideoStream:
 *       type: object
 *       properties:
 *         sport_id:
 *           type: number
 *           description: Sport type (1-football, 2-basketball)
 *           example: 1
 *         match_id:
 *           type: string
 *           description: Unique match identifier
 *           example: "n54qllhp2gd1qvy"
 *         match_time:
 *           type: number
 *           description: Match timestamp
 *           example: 1644886800
 *         pushurl1:
 *           type: string
 *           description: SD stream address (RTMP)
 *           example: "rtmp://xxxx/xx/sd-1-3674457"
 *         pushurl2:
 *           type: string
 *           description: English HD stream address (RTMP), can be empty
 *           example: ""
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Record creation time
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Record last update time
 */

/**
 * @swagger
 * /api/video-streams:
 *   get:
 *     summary: Lấy tất cả video streams
 *     tags: [Video Streams]
 *     responses:
 *       200:
 *         description: Danh sách video streams
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VideoStream'
 *       500:
 *         description: Lỗi server
 */
router.get('/', videoStreamController.getAllVideoStreams);

// Specific routes must come BEFORE parameterized routes
/**
 * @swagger
 * /api/video-streams/active:
 *   get:
 *     summary: Lấy các video streams đang hoạt động
 *     tags: [Video Streams]
 *     responses:
 *       200:
 *         description: Danh sách video streams đang hoạt động
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VideoStream'
 *       500:
 *         description: Lỗi server
 */
router.get('/active', videoStreamController.getActiveStreams);

/**
 * @swagger
 * /api/video-streams/upcoming:
 *   get:
 *     summary: Lấy các trận đấu sắp diễn ra
 *     tags: [Video Streams]
 *     parameters:
 *       - in: query
 *         name: hours
 *         schema:
 *           type: integer
 *           default: 24
 *         description: Số giờ tương lai để lấy trận (mặc định 24h)
 *     responses:
 *       200:
 *         description: Danh sách trận đấu sắp diễn ra
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VideoStream'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     hoursAhead:
 *                       type: number
 *                     totalMatches:
 *                       type: number
 *       500:
 *         description: Lỗi server
 */
router.get('/upcoming', videoStreamController.getUpcomingMatches);

/**
 * @swagger
 * /api/video-streams/live:
 *   get:
 *     summary: Lấy các trận đấu đang diễn ra
 *     tags: [Video Streams]
 *     responses:
 *       200:
 *         description: Danh sách trận đấu đang diễn ra
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VideoStream'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalLiveMatches:
 *                       type: number
 *       500:
 *         description: Lỗi server
 */
router.get('/live', videoStreamController.getLiveMatches);

/**
 * @swagger
 * /api/video-streams/status:
 *   get:
 *     summary: Lấy trận đấu với thông tin trạng thái (upcoming/live/finished)
 *     tags: [Video Streams]
 *     responses:
 *       200:
 *         description: Danh sách trận đấu với trạng thái
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 results:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/VideoStream'
 *                       - type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                             enum: [upcoming, live, finished]
 *                           timeUntilMatch:
 *                             type: number
 *                             description: Seconds until match starts (if upcoming)
 *                           timeFromStart:
 *                             type: number
 *                             description: Seconds since match started (if live/finished)
 *                           matchTimeFormatted:
 *                             type: string
 *                             format: date-time
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     upcoming:
 *                       type: number
 *                     live:
 *                       type: number
 *                     finished:
 *                       type: number
 *       500:
 *         description: Lỗi server
 */
router.get('/status', videoStreamController.getMatchesWithStatus);

/**
 * @swagger
 * /api/video-streams/range:
 *   get:
 *     summary: Lấy trận đấu trong khoảng thời gian
 *     tags: [Video Streams]
 *     parameters:
 *       - in: query
 *         name: startTime
 *         required: true
 *         schema:
 *           type: integer
 *         description: Timestamp bắt đầu (Unix timestamp)
 *       - in: query
 *         name: endTime
 *         required: true
 *         schema:
 *           type: integer
 *         description: Timestamp kết thúc (Unix timestamp)
 *     responses:
 *       200:
 *         description: Danh sách trận đấu trong khoảng thời gian
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VideoStream'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     startTime:
 *                       type: number
 *                     endTime:
 *                       type: number
 *                     totalMatches:
 *                       type: number
 *       400:
 *         description: Thiếu tham số startTime hoặc endTime
 *       500:
 *         description: Lỗi server
 */
router.get('/range', videoStreamController.getMatchesByTimeRange);

/**
 * @swagger
 * /api/video-streams/demo-timing:
 *   get:
 *     summary: Demo công thức tính phút trận đấu với mock data
 *     tags: [Video Streams]
 *     responses:
 *       200:
 *         description: Demo các trường hợp tính phút trận đấu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Demo công thức tính phút trận đấu"
 *                 currentTimestamp:
 *                   type: number
 *                   description: Timestamp hiện tại
 *                 currentTime:
 *                   type: string
 *                   description: Thời gian hiện tại định dạng
 *                 formulas:
 *                   type: object
 *                   properties:
 *                     firstHalf:
 *                       type: string
 *                       example: "Hiệp 1: match minutes = (current timestamp - first half kick-off timestamp) / 60 + 1"
 *                     secondHalf:
 *                       type: string
 *                       example: "Hiệp 2: match minutes = (current timestamp - second half kick-off timestamp) / 60 + 45 + 1"
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       match_id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       timingInfo:
 *                         type: object
 *                         properties:
 *                           matchMinutes:
 *                             type: number
 *                           half:
 *                             type: string
 *                           displayTime:
 *                             type: string
 *                           isLive:
 *                             type: boolean
 *                       formula:
 *                         type: string
 *       500:
 *         description: Lỗi server
 */
router.get('/demo-timing', videoStreamController.demoMatchTiming);

/**
 * @swagger
 * /api/video-streams/timing/{match_id}:
 *   get:
 *     summary: Lấy thông tin thời gian chi tiết của trận đấu
 *     tags: [Video Streams]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *       - in: query
 *         name: secondHalfKickoff
 *         schema:
 *           type: integer
 *         description: Timestamp bắt đầu hiệp 2 (Unix timestamp, tùy chọn)
 *     responses:
 *       200:
 *         description: Thông tin thời gian chi tiết của trận đấu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 result:
 *                   type: object
 *                   properties:
 *                     match_id:
 *                       type: string
 *                       example: "n54qllhp2gd1qvy"
 *                     sport_id:
 *                       type: number
 *                       example: 1
 *                     kickoffTime:
 *                       type: number
 *                       description: Timestamp kick-off trận đấu
 *                     kickoffTimeFormatted:
 *                       type: string
 *                       format: date-time
 *                       description: Thời gian kick-off định dạng ISO
 *                     currentTime:
 *                       type: number
 *                       description: Timestamp hiện tại
 *                     currentTimeFormatted:
 *                       type: string
 *                       format: date-time
 *                       description: Thời gian hiện tại định dạng ISO
 *                     matchMinutes:
 *                       type: number
 *                       description: Phút thứ bao nhiêu của trận đấu
 *                       example: 23
 *                     half:
 *                       type: string
 *                       enum: [pre-match, first-half, half-time, second-half, finished]
 *                       description: Hiệp đang diễn ra
 *                     displayTime:
 *                       type: string
 *                       description: Hiển thị thời gian (23', HT, FT)
 *                       example: "23'"
 *                     isLive:
 *                       type: boolean
 *                       description: Trận đấu có đang diễn ra không
 *                     timeInHalf:
 *                       type: number
 *                       description: Phút trong hiệp hiện tại
 *       404:
 *         description: Trận đấu không tìm thấy
 *       500:
 *         description: Lỗi server
 */
router.get('/timing/:match_id', videoStreamController.getMatchTiming);

/**
 * @swagger
 * /api/video-streams/sport/{sport_id}:
 *   get:
 *     summary: Lấy video streams theo sport ID
 *     tags: [Video Streams]
 *     parameters:
 *       - in: path
 *         name: sport_id
 *         required: true
 *         schema:
 *           type: number
 *         description: Sport ID (1-football, 2-basketball)
 *     responses:
 *       200:
 *         description: Danh sách video streams theo sport
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VideoStream'
 *       500:
 *         description: Lỗi server
 */
router.get('/sport/:sport_id', videoStreamController.getVideoStreamsBySportId);

// Parameterized route MUST come last to avoid conflicts
/**
 * @swagger
 * /api/video-streams/{match_id}:
 *   get:
 *     summary: Lấy video stream theo match ID
 *     tags: [Video Streams]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Thông tin video stream
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 result:
 *                   $ref: '#/components/schemas/VideoStream'
 *       404:
 *         description: Video stream không tìm thấy
 *       500:
 *         description: Lỗi server
 */
router.get('/:match_id', videoStreamController.getVideoStreamByMatchId);

module.exports = router;
