const express = require('express');
const router = express.Router();
const headToHeadController = require('../controllers/headToHeadController');

/**
 * @swagger
 * components:
 *   schemas:
 *     MatchInfo:
 *       type: object
 *       properties:
 *         match_id:
 *           type: string
 *           description: ID trận đấu
 *         competition_id:
 *           type: string
 *           description: ID giải đấu
 *         match_status:
 *           type: integer
 *           description: Trạng thái trận đấu
 *         match_time:
 *           type: integer
 *           description: Thời gian trận đấu (timestamp)
 *         kickoff_timestamp:
 *           type: integer
 *           description: Thời gian bắt đầu (timestamp)
 *         home_team:
 *           type: object
 *           properties:
 *             team_id:
 *               type: string
 *               description: ID đội nhà
 *             league_ranking:
 *               type: string
 *               description: Thứ hạng trong giải
 *             regular_score:
 *               type: integer
 *               description: Tỷ số chính thức
 *             halftime_score:
 *               type: integer
 *               description: Tỷ số hiệp 1
 *             red_cards:
 *               type: integer
 *               description: Số thẻ đỏ
 *             yellow_cards:
 *               type: integer
 *               description: Số thẻ vàng
 *             corners:
 *               type: integer
 *               description: Số phạt góc
 *             overtime_score:
 *               type: integer
 *               description: Tỷ số hiệp phụ
 *             penalty_score:
 *               type: integer
 *               description: Tỷ số đá luân lưu
 *         away_team:
 *           type: object
 *           properties:
 *             team_id:
 *               type: string
 *               description: ID đội khách
 *             league_ranking:
 *               type: string
 *               description: Thứ hạng trong giải
 *             regular_score:
 *               type: integer
 *               description: Tỷ số chính thức
 *             halftime_score:
 *               type: integer
 *               description: Tỷ số hiệp 1
 *             red_cards:
 *               type: integer
 *               description: Số thẻ đỏ
 *             yellow_cards:
 *               type: integer
 *               description: Số thẻ vàng
 *             corners:
 *               type: integer
 *               description: Số phạt góc
 *             overtime_score:
 *               type: integer
 *               description: Tỷ số hiệp phụ
 *             penalty_score:
 *               type: integer
 *               description: Tỷ số đá luân lưu
 *         odds:
 *           type: object
 *           properties:
 *             asian_handicap:
 *               type: string
 *               description: Kèo châu Á
 *             european_odds:
 *               type: string
 *               description: Kèo châu Âu
 *             over_under:
 *               type: string
 *               description: Kèo tài xỉu
 *             corner_odds:
 *               type: string
 *               description: Kèo phạt góc
 *         match_details:
 *           type: object
 *           properties:
 *             description:
 *               type: string
 *               description: Mô tả trận đấu
 *             is_neutral:
 *               type: integer
 *               description: Sân trung lập (1=có, 0=không)
 *             round:
 *               type: integer
 *               description: Vòng đấu
 *         season_info:
 *           type: object
 *           properties:
 *             season_id:
 *               type: string
 *               description: ID mùa giải
 *             season_year:
 *               type: string
 *               description: Năm mùa giải
 * 
 *     GoalDistributionSegment:
 *       type: object
 *       properties:
 *         number:
 *           type: integer
 *           description: Số bàn thắng
 *         percentage:
 *           type: integer
 *           description: Tỷ lệ phần trăm
 *         start_time:
 *           type: integer
 *           description: Thời gian bắt đầu (phút)
 *         end_time:
 *           type: integer
 *           description: Thời gian kết thúc (phút)
 * 
 *     TeamGoalDistribution:
 *       type: object
 *       properties:
 *         all:
 *           type: object
 *           properties:
 *             matches:
 *               type: integer
 *               description: Tổng số trận
 *             scored:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GoalDistributionSegment'
 *               description: Phân bố bàn thắng ghi được
 *             conceded:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GoalDistributionSegment'
 *               description: Phân bố bàn thắng thủng lưới
 *         home:
 *           type: object
 *           properties:
 *             matches:
 *               type: integer
 *               description: Số trận sân nhà
 *             scored:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GoalDistributionSegment'
 *             conceded:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GoalDistributionSegment'
 *         away:
 *           type: object
 *           properties:
 *             matches:
 *               type: integer
 *               description: Số trận sân khách
 *             scored:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GoalDistributionSegment'
 *             conceded:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GoalDistributionSegment'
 * 
 *     HeadToHead:
 *       type: object
 *       properties:
 *         h2h_id:
 *           type: string
 *           description: ID duy nhất cho thống kê đối đầu
 *         home_team_id:
 *           type: string
 *           description: ID đội nhà
 *         away_team_id:
 *           type: string
 *           description: ID đội khách
 *         info:
 *           $ref: '#/components/schemas/MatchInfo'
 *         history:
 *           type: object
 *           properties:
 *             vs:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MatchInfo'
 *               description: Lịch sử đối đầu
 *             home:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MatchInfo'
 *               description: Thành tích gần đây đội nhà
 *             away:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MatchInfo'
 *               description: Thành tích gần đây đội khách
 *         future:
 *           type: object
 *           properties:
 *             home:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MatchInfo'
 *               description: Lịch thi đấu đội nhà
 *             away:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MatchInfo'
 *               description: Lịch thi đấu đội khách
 *         goal_distribution:
 *           type: object
 *           properties:
 *             home:
 *               $ref: '#/components/schemas/TeamGoalDistribution'
 *             away:
 *               $ref: '#/components/schemas/TeamGoalDistribution'
 *         last_updated:
 *           type: integer
 *           description: Thời gian cập nhật cuối (timestamp)
 *         data_source:
 *           type: string
 *           description: Nguồn dữ liệu
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/head-to-head:
 *   get:
 *     summary: Lấy tất cả dữ liệu thống kê đối đầu
 *     tags: [Head-to-Head]
 *     responses:
 *       200:
 *         description: Danh sách thống kê đối đầu
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
 *                     $ref: '#/components/schemas/HeadToHead'
 */
router.get('/', headToHeadController.getAllHeadToHeadData);

/**
 * @swagger
 * /api/head-to-head/teams/{home_team_id}/{away_team_id}:
 *   get:
 *     summary: Lấy thống kê đối đầu giữa 2 đội
 *     tags: [Head-to-Head]
 *     parameters:
 *       - in: path
 *         name: home_team_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID đội nhà
 *       - in: path
 *         name: away_team_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID đội khách
 *     responses:
 *       200:
 *         description: Thống kê đối đầu giữa 2 đội
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/HeadToHead'
 *       404:
 *         description: Không tìm thấy dữ liệu đối đầu
 */
router.get('/teams/:home_team_id/:away_team_id', headToHeadController.getHeadToHeadByTeams);

/**
 * @swagger
 * /api/head-to-head/match-history/{home_team_id}/{away_team_id}:
 *   get:
 *     summary: Lấy lịch sử đối đầu và thống kê chi tiết
 *     tags: [Head-to-Head]
 *     parameters:
 *       - in: path
 *         name: home_team_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID đội nhà
 *       - in: path
 *         name: away_team_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID đội khách
 *     responses:
 *       200:
 *         description: Lịch sử đối đầu và thống kê
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
 *                     home_team_id:
 *                       type: string
 *                     away_team_id:
 *                       type: string
 *                     total_matches:
 *                       type: integer
 *                       description: Tổng số trận đối đầu
 *                     home_wins:
 *                       type: integer
 *                       description: Số trận đội nhà thắng
 *                     away_wins:
 *                       type: integer
 *                       description: Số trận đội khách thắng
 *                     draws:
 *                       type: integer
 *                       description: Số trận hòa
 *                     recent_matches:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MatchInfo'
 *                       description: 10 trận gần nhất
 *                     all_matches:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MatchInfo'
 *                       description: Tất cả trận đối đầu
 */
router.get('/match-history/:home_team_id/:away_team_id', headToHeadController.getMatchHistory);

/**
 * @swagger
 * /api/head-to-head/goal-distribution/{home_team_id}/{away_team_id}:
 *   get:
 *     summary: Lấy phân bố bàn thắng của 2 đội
 *     tags: [Head-to-Head]
 *     parameters:
 *       - in: path
 *         name: home_team_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID đội nhà
 *       - in: path
 *         name: away_team_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID đội khách
 *     responses:
 *       200:
 *         description: Phân bố bàn thắng của 2 đội
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
 *                     home_team_id:
 *                       type: string
 *                     away_team_id:
 *                       type: string
 *                     goal_distribution:
 *                       type: object
 *                       properties:
 *                         home:
 *                           $ref: '#/components/schemas/TeamGoalDistribution'
 *                         away:
 *                           $ref: '#/components/schemas/TeamGoalDistribution'
 */
router.get('/goal-distribution/:home_team_id/:away_team_id', headToHeadController.getGoalDistribution);

/**
 * @swagger
 * /api/head-to-head/team/{team_id}/history:
 *   get:
 *     summary: Lấy lịch sử thi đấu của một đội
 *     tags: [Head-to-Head]
 *     parameters:
 *       - in: path
 *         name: team_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID đội bóng
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, home, away]
 *           default: all
 *         description: Loại trận đấu (all=tất cả, home=sân nhà, away=sân khách)
 *     responses:
 *       200:
 *         description: Lịch sử thi đấu của đội
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 team_id:
 *                   type: string
 *                 type:
 *                   type: string
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/HeadToHead'
 */
router.get('/team/:team_id/history', headToHeadController.getTeamHistory);

/**
 * @swagger
 * /api/head-to-head/team/{team_id}/future:
 *   get:
 *     summary: Lấy lịch thi đấu sắp tới của một đội
 *     tags: [Head-to-Head]
 *     parameters:
 *       - in: path
 *         name: team_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID đội bóng
 *     responses:
 *       200:
 *         description: Lịch thi đấu sắp tới
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
 *                     team_id:
 *                       type: string
 *                     total_future_matches:
 *                       type: integer
 *                     matches:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MatchInfo'
 */
router.get('/team/:team_id/future', headToHeadController.getFutureMatches);

/**
 * @swagger
 * /api/head-to-head/{h2h_id}:
 *   get:
 *     summary: Lấy thống kê đối đầu theo ID
 *     tags: [Head-to-Head]
 *     parameters:
 *       - in: path
 *         name: h2h_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID thống kê đối đầu
 *     responses:
 *       200:
 *         description: Thống kê đối đầu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/HeadToHead'
 *       404:
 *         description: Không tìm thấy dữ liệu
 */
router.get('/:h2h_id', headToHeadController.getHeadToHeadById);

/**
 * @swagger
 * /api/head-to-head:
 *   post:
 *     summary: Tạo hoặc cập nhật thống kê đối đầu
 *     tags: [Head-to-Head]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 info:
 *                   type: array
 *                   description: Mảng thông tin trận đấu chính (10 elements)
 *                 history:
 *                   type: object
 *                   properties:
 *                     vs:
 *                       type: array
 *                       description: Mảng lịch sử đối đầu
 *                     home:
 *                       type: array
 *                       description: Mảng thành tích gần đây đội nhà
 *                     away:
 *                       type: array
 *                       description: Mảng thành tích gần đây đội khách
 *                 future:
 *                   type: object
 *                   properties:
 *                     home:
 *                       type: array
 *                       description: Mảng lịch thi đấu đội nhà
 *                     away:
 *                       type: array
 *                       description: Mảng lịch thi đấu đội khách
 *                 goal_distribution:
 *                   type: object
 *                   properties:
 *                     home:
 *                       type: object
 *                       description: Phân bố bàn thắng đội nhà
 *                     away:
 *                       type: object
 *                       description: Phân bố bàn thắng đội khách
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
 */
router.post('/', headToHeadController.createOrUpdateHeadToHead);

/**
 * @swagger
 * /api/head-to-head/{h2h_id}:
 *   delete:
 *     summary: Xóa thống kê đối đầu
 *     tags: [Head-to-Head]
 *     parameters:
 *       - in: path
 *         name: h2h_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID thống kê đối đầu
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
router.delete('/:h2h_id', headToHeadController.deleteHeadToHead);

module.exports = router;
