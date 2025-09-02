const express = require('express');
const router = express.Router();
const realTimeDataController = require('../controllers/realTimeDataController');

/**
 * @swagger
 * components:
 *   schemas:
 *     RealTimeScore:
 *       type: object
 *       properties:
 *         match_id:
 *           type: string
 *           description: ID của trận đấu
 *         status:
 *           type: integer
 *           description: Trạng thái trận đấu
 *         home_scores:
 *           type: object
 *           properties:
 *             regular_score:
 *               type: integer
 *               description: Tỷ số chính thức đội nhà
 *             halftime_score:
 *               type: integer
 *               description: Tỷ số hiệp 1 đội nhà
 *             red_cards:
 *               type: integer
 *               description: Số thẻ đỏ đội nhà
 *             yellow_cards:
 *               type: integer
 *               description: Số thẻ vàng đội nhà
 *             corners:
 *               type: integer
 *               description: Số phạt góc đội nhà
 *             overtime_score:
 *               type: integer
 *               description: Tỷ số hiệp phụ đội nhà
 *             penalty_score:
 *               type: integer
 *               description: Tỷ số đá luân lưu đội nhà
 *         away_scores:
 *           type: object
 *           properties:
 *             regular_score:
 *               type: integer
 *               description: Tỷ số chính thức đội khách
 *             halftime_score:
 *               type: integer
 *               description: Tỷ số hiệp 1 đội khách
 *             red_cards:
 *               type: integer
 *               description: Số thẻ đỏ đội khách
 *             yellow_cards:
 *               type: integer
 *               description: Số thẻ vàng đội khách
 *             corners:
 *               type: integer
 *               description: Số phạt góc đội khách
 *             overtime_score:
 *               type: integer
 *               description: Tỷ số hiệp phụ đội khách
 *             penalty_score:
 *               type: integer
 *               description: Tỷ số đá luân lưu đội khách
 *         kickoff_timestamp:
 *           type: integer
 *           description: Thời gian bắt đầu trận đấu (timestamp)
 *         compatible_ignore:
 *           type: string
 *           description: Thông tin tương thích bổ sung
 * 
 *     RealTimeStats:
 *       type: object
 *       properties:
 *         home_value:
 *           type: integer
 *           description: Giá trị thống kê đội nhà
 *         away_value:
 *           type: integer
 *           description: Giá trị thống kê đội khách
 *         stat_type:
 *           type: integer
 *           description: Loại thống kê
 *         stat_name:
 *           type: string
 *           description: Tên thống kê
 * 
 *     RealTimeIncident:
 *       type: object
 *       properties:
 *         time:
 *           type: string
 *           description: Thời gian sự kiện
 *         type:
 *           type: integer
 *           description: Loại sự kiện
 *         team:
 *           type: integer
 *           description: ID đội (1=nhà, 2=khách)
 *         player_id:
 *           type: string
 *           description: ID cầu thủ
 *         player_name:
 *           type: string
 *           description: Tên cầu thủ
 *         related_player_id:
 *           type: string
 *           description: ID cầu thủ liên quan
 *         related_player_name:
 *           type: string
 *           description: Tên cầu thủ liên quan
 *         description:
 *           type: string
 *           description: Mô tả sự kiện
 *         var_decision:
 *           type: string
 *           description: Quyết định VAR
 *         score_home:
 *           type: integer
 *           description: Tỷ số đội nhà sau sự kiện
 *         score_away:
 *           type: integer
 *           description: Tỷ số đội khách sau sự kiện
 * 
 *     RealTimeTextLive:
 *       type: object
 *       properties:
 *         time:
 *           type: string
 *           description: Thời gian sự kiện
 *         text:
 *           type: string
 *           description: Nội dung bình luận trực tiếp
 *         type:
 *           type: integer
 *           description: Loại bình luận
 * 
 *     RealTimeData:
 *       type: object
 *       properties:
 *         match_id:
 *           type: string
 *           description: ID trận đấu
 *         score:
 *           $ref: '#/components/schemas/RealTimeScore'
 *         stats:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RealTimeStats'
 *           description: Thống kê trận đấu
 *         incidents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RealTimeIncident'
 *           description: Sự kiện trong trận
 *         tlive:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RealTimeTextLive'
 *           description: Bình luận trực tiếp
 *         last_updated:
 *           type: integer
 *           description: Thời gian cập nhật cuối (timestamp)
 *         is_live:
 *           type: boolean
 *           description: Trận đấu có đang diễn ra hay không
 *         data_source:
 *           type: string
 *           description: Nguồn dữ liệu
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật
 */

/**
 * @swagger
 * /api/realtime:
 *   get:
 *     summary: Lấy tất cả dữ liệu real-time
 *     tags: [Real-time Data]
 *     responses:
 *       200:
 *         description: Danh sách dữ liệu real-time
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                   description: Tổng số bản ghi
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RealTimeData'
 */
router.get('/', realTimeDataController.getAllRealTimeData);

/**
 * @swagger
 * /api/realtime/live:
 *   get:
 *     summary: Lấy tất cả trận đấu đang diễn ra
 *     tags: [Real-time Data]
 *     responses:
 *       200:
 *         description: Danh sách trận đấu đang live
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total_live_matches:
 *                   type: integer
 *                   description: Số trận đang live
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RealTimeData'
 */
router.get('/live', realTimeDataController.getLiveMatches);

/**
 * @swagger
 * /api/realtime/recent:
 *   get:
 *     summary: Lấy dữ liệu được cập nhật gần đây
 *     tags: [Real-time Data]
 *     parameters:
 *       - in: query
 *         name: minutes
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Số phút gần đây (mặc định 30 phút)
 *     responses:
 *       200:
 *         description: Dữ liệu được cập nhật gần đây
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 updated_within_minutes:
 *                   type: integer
 *                   description: Số phút đã lọc
 *                 total:
 *                   type: integer
 *                   description: Tổng số bản ghi
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RealTimeData'
 */
router.get('/recent', realTimeDataController.getRecentlyUpdated);

/**
 * @swagger
 * /api/realtime/status/{status}:
 *   get:
 *     summary: Lấy trận đấu theo trạng thái
 *     tags: [Real-time Data]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: integer
 *         description: Trạng thái trận đấu (0=chưa bắt đầu, 1=hiệp 1, 2=giải lao, 3=hiệp 2, 4=kết thúc, 5=hiệp phụ, 6=đá luân lưu, 7=hoãn, 8=hủy)
 *     responses:
 *       200:
 *         description: Danh sách trận đấu theo trạng thái
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: integer
 *                   description: Trạng thái đã lọc
 *                 total:
 *                   type: integer
 *                   description: Tổng số trận
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RealTimeData'
 */
router.get('/status/:status', realTimeDataController.getMatchesByStatus);

/**
 * @swagger
 * /api/realtime/{match_id}:
 *   get:
 *     summary: Lấy dữ liệu real-time theo ID trận đấu
 *     tags: [Real-time Data]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của trận đấu
 *     responses:
 *       200:
 *         description: Dữ liệu real-time của trận đấu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RealTimeData'
 *       404:
 *         description: Không tìm thấy dữ liệu
 */
router.get('/:match_id', realTimeDataController.getRealTimeDataByMatchId);

/**
 * @swagger
 * /api/realtime/{match_id}/stats:
 *   get:
 *     summary: Lấy thống kê trận đấu
 *     tags: [Real-time Data]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của trận đấu
 *     responses:
 *       200:
 *         description: Thống kê của trận đấu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     match_id:
 *                       type: string
 *                     score:
 *                       $ref: '#/components/schemas/RealTimeScore'
 *                     stats:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RealTimeStats'
 *                     last_updated:
 *                       type: integer
 *                     is_live:
 *                       type: boolean
 */
router.get('/:match_id/stats', realTimeDataController.getMatchStats);

/**
 * @swagger
 * /api/realtime/{match_id}/incidents:
 *   get:
 *     summary: Lấy sự kiện trận đấu
 *     tags: [Real-time Data]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của trận đấu
 *       - in: query
 *         name: type
 *         schema:
 *           type: integer
 *         description: Loại sự kiện (1=bàn thắng, 2=thẻ vàng, 3=thẻ đỏ, 4=thay người, v.v.)
 *     responses:
 *       200:
 *         description: Sự kiện của trận đấu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     match_id:
 *                       type: string
 *                     incidents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RealTimeIncident'
 *                     total_incidents:
 *                       type: integer
 */
router.get('/:match_id/incidents', realTimeDataController.getMatchIncidents);

/**
 * @swagger
 * /api/realtime/{match_id}/textlive:
 *   get:
 *     summary: Lấy bình luận trực tiếp
 *     tags: [Real-time Data]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của trận đấu
 *     responses:
 *       200:
 *         description: Bình luận trực tiếp của trận đấu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     match_id:
 *                       type: string
 *                     tlive:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RealTimeTextLive'
 *                     total_events:
 *                       type: integer
 *                     last_updated:
 *                       type: integer
 */
router.get('/:match_id/textlive', realTimeDataController.getMatchTextLive);

/**
 * @swagger
 * /api/realtime:
 *   post:
 *     summary: Tạo hoặc cập nhật dữ liệu real-time
 *     tags: [Real-time Data]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 score:
 *                   type: array
 *                   description: Mảng dữ liệu tỷ số [match_id, status, home_scores[], away_scores[], kickoff_timestamp, compatible_ignore]
 *                 stats:
 *                   type: array
 *                   description: Mảng thống kê trận đấu
 *                 incidents:
 *                   type: array
 *                   description: Mảng sự kiện trận đấu
 *                 tlive:
 *                   type: array
 *                   description: Mảng bình luận trực tiếp
 *     responses:
 *       200:
 *         description: Dữ liệu được xử lý thành công
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
 *                 summary:
 *                   type: object
 *                   properties:
 *                     created:
 *                       type: integer
 *                     updated:
 *                       type: integer
 *                     errors:
 *                       type: integer
 *                     total_processed:
 *                       type: integer
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.post('/', realTimeDataController.createOrUpdateRealTimeData);

/**
 * @swagger
 * /api/realtime/{match_id}:
 *   delete:
 *     summary: Xóa dữ liệu real-time
 *     tags: [Real-time Data]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của trận đấu
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *       404:
 *         description: Không tìm thấy dữ liệu để xóa
 */
router.delete('/:match_id', realTimeDataController.deleteRealTimeData);

module.exports = router;
