const videoStreamService = require('../services/videoStreamService');

// GET /api/video-streams - Lấy tất cả video streams
const getAllVideoStreams = async (req, res) => {
  const result = await videoStreamService.getAllVideoStreams();
  
  if (result.success) {
    res.json({
      code: 200,
      results: result.data
    });
  } else {
    res.status(500).json({
      code: 500,
      message: result.error
    });
  }
};

// GET /api/video-streams/:match_id - Lấy video stream theo match ID
const getVideoStreamByMatchId = async (req, res) => {
  const result = await videoStreamService.getVideoStreamByMatchId(req.params.match_id);
  
  if (result.success) {
    res.json({
      code: 200,
      result: result.data
    });
  } else {
    const statusCode = result.statusCode || 500;
    res.status(statusCode).json({
      code: statusCode,
      message: result.error
    });
  }
};

// GET /api/video-streams/sport/:sport_id - Lấy video streams theo sport ID
const getVideoStreamsBySportId = async (req, res) => {
  const result = await videoStreamService.getVideoStreamsBySportId(parseInt(req.params.sport_id));
  
  if (result.success) {
    res.json({
      code: 200,
      results: result.data
    });
  } else {
    res.status(500).json({
      code: 500,
      message: result.error
    });
  }
};

// GET /api/video-streams/active - Lấy các streams đang hoạt động
const getActiveStreams = async (req, res) => {
  const result = await videoStreamService.getActiveStreams();
  
  if (result.success) {
    res.json({
      code: 200,
      results: result.data
    });
  } else {
    res.status(500).json({
      code: 500,
      message: result.error
    });
  }
};

// GET /api/video-streams/upcoming - Lấy các trận sắp diễn ra
const getUpcomingMatches = async (req, res) => {
  const hoursAhead = parseInt(req.query.hours) || 24; // Default 24 hours
  const result = await videoStreamService.getUpcomingMatches(hoursAhead);
  
  if (result.success) {
    res.json({
      code: 200,
      results: result.data,
      meta: {
        hoursAhead,
        totalMatches: result.data.length
      }
    });
  } else {
    res.status(500).json({
      code: 500,
      message: result.error
    });
  }
};

// GET /api/video-streams/live - Lấy các trận đang diễn ra
const getLiveMatches = async (req, res) => {
  const result = await videoStreamService.getLiveMatches();
  
  if (result.success) {
    res.json({
      code: 200,
      results: result.data,
      meta: {
        totalLiveMatches: result.data.length
      }
    });
  } else {
    res.status(500).json({
      code: 500,
      message: result.error
    });
  }
};

// GET /api/video-streams/status - Lấy trận với thông tin trạng thái
const getMatchesWithStatus = async (req, res) => {
  const result = await videoStreamService.getMatchesWithStatus();
  
  if (result.success) {
    const data = result.data;
    const summary = {
      total: data.length,
      upcoming: data.filter(m => m.status === 'upcoming').length,
      live: data.filter(m => m.status === 'live').length,
      finished: data.filter(m => m.status === 'finished').length
    };
    
    res.json({
      code: 200,
      results: data,
      summary
    });
  } else {
    res.status(500).json({
      code: 500,
      message: result.error
    });
  }
};

// GET /api/video-streams/range - Lấy trận trong khoảng thời gian
const getMatchesByTimeRange = async (req, res) => {
  const { startTime, endTime } = req.query;
  
  if (!startTime || !endTime) {
    return res.status(400).json({
      code: 400,
      message: 'startTime and endTime parameters are required'
    });
  }
  
  const result = await videoStreamService.getMatchesByTimeRange(
    parseInt(startTime), 
    parseInt(endTime)
  );
  
  if (result.success) {
    res.json({
      code: 200,
      results: result.data,
      meta: {
        startTime: parseInt(startTime),
        endTime: parseInt(endTime),
        totalMatches: result.data.length
      }
    });
  } else {
    res.status(500).json({
      code: 500,
      message: result.error
    });
  }
};

// GET /api/video-streams/timing/:match_id - Lấy thông tin thời gian chi tiết của trận đấu
const getMatchTiming = async (req, res) => {
  const { match_id } = req.params;
  const { secondHalfKickoff } = req.query;
  
  const result = await videoStreamService.getMatchTiming(
    match_id, 
    secondHalfKickoff ? parseInt(secondHalfKickoff) : null
  );
  
  if (result.success) {
    res.json({
      code: 200,
      result: result.data
    });
  } else {
    const statusCode = result.statusCode || 500;
    res.status(statusCode).json({
      code: statusCode,
      message: result.error
    });
  }
};

// GET /api/video-streams/demo-timing - Demo tính phút trận đấu với mock data
const demoMatchTiming = async (req, res) => {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    // Mock data để demo công thức
    const demoMatches = [
      {
        match_id: "demo_upcoming",
        name: "Trận sắp diễn ra (1 giờ nữa)",
        kickoff: now + 3600,
        description: "Upcoming match in 1 hour"
      },
      {
        match_id: "demo_first_half_15min", 
        name: "Hiệp 1 - Phút 15",
        kickoff: now - 900, // 15 phút trước
        description: "First half, 15 minutes in"
      },
      {
        match_id: "demo_first_half_30min",
        name: "Hiệp 1 - Phút 30", 
        kickoff: now - 1800, // 30 phút trước
        description: "First half, 30 minutes in"
      },
      {
        match_id: "demo_half_time",
        name: "Giải lao (Hiệp 1 đã kết thúc)",
        kickoff: now - 2700, // 45 phút trước
        description: "Half time break"
      },
      {
        match_id: "demo_second_half_60min",
        name: "Hiệp 2 - Phút 60",
        kickoff: now - 3600, // 60 phút trước (giả sử hiệp 2 bắt đầu sau 60 phút)
        secondHalf: now - 900, // Hiệp 2 bắt đầu 15 phút trước
        description: "Second half, 15 minutes in (60th minute total)"
      },
      {
        match_id: "demo_second_half_75min",
        name: "Hiệp 2 - Phút 75", 
        kickoff: now - 4500, // 75 phút trước
        secondHalf: now - 1800, // Hiệp 2 bắt đầu 30 phút trước  
        description: "Second half, 30 minutes in (75th minute total)"
      },
      {
        match_id: "demo_finished",
        name: "Trận đã kết thúc",
        kickoff: now - 7200, // 2 giờ trước
        description: "Match finished"
      }
    ];
    
    // Tính toán timing cho từng trận demo
    const results = demoMatches.map(match => {
      const timing = videoStreamService.calculateMatchMinutes(
        now, 
        match.kickoff, 
        match.secondHalf
      );
      
      return {
        match_id: match.match_id,
        name: match.name,
        description: match.description,
        kickoffTime: match.kickoff,
        kickoffFormatted: new Date(match.kickoff * 1000).toLocaleString(),
        currentTime: now,
        currentTimeFormatted: new Date(now * 1000).toLocaleString(),
        timingInfo: timing,
        formula: match.secondHalf && timing.half === 'second-half' 
          ? `Hiệp 2: (${now} - ${match.secondHalf}) / 60 + 45 + 1 = ${timing.matchMinutes} phút`
          : timing.half === 'first-half'
          ? `Hiệp 1: (${now} - ${match.kickoff}) / 60 + 1 = ${timing.matchMinutes} phút`
          : 'N/A'
      };
    });
    
    res.json({
      code: 200,
      message: "Demo công thức tính phút trận đấu",
      currentTimestamp: now,
      currentTime: new Date(now * 1000).toLocaleString(),
      formulas: {
        firstHalf: "Hiệp 1: match minutes = (current timestamp - first half kick-off timestamp) / 60 + 1",
        secondHalf: "Hiệp 2: match minutes = (current timestamp - second half kick-off timestamp) / 60 + 45 + 1"
      },
      results
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message
    });
  }
};

module.exports = {
  getAllVideoStreams,
  getVideoStreamByMatchId,
  getVideoStreamsBySportId,
  getActiveStreams,
  getUpcomingMatches,
  getLiveMatches,
  getMatchesWithStatus,
  getMatchesByTimeRange,
  getMatchTiming,
  demoMatchTiming
};
