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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Real-time data not found for this match
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 */
router.get('/:match_id', realTimeDataController.getRealTimeDataByMatchId);

module.exports = router;
