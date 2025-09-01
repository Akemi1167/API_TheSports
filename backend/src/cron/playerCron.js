const cron = require('node-cron');
const axios = require('axios');
const Player = require('../models/player');

// Cấu hình API
const API_CONFIG = {
  baseURL: 'https://api.thesports.com/v1',
  user: 'abcvty',
  secret: '5b2bae3b821a03197c8caa3083098d78'
};

// Hàm đồng bộ dữ liệu players
const syncPlayers = async () => {
  try {
    console.log('👨‍💼 Starting players synchronization...');
    
    // Gọi API để lấy dữ liệu players
    const response = await axios.get(`${API_CONFIG.baseURL}/football/player/list`, {
      params: {
        user: API_CONFIG.user,
        secret: API_CONFIG.secret
      },
      timeout: 30000
    });

    const players = response.data.results || [];
    console.log(`📡 Fetched ${players.length} players from API`);

    // Xoá toàn bộ dữ liệu cũ và insert mới
    await Player.deleteMany({});
    
    if (players.length > 0) {
      await Player.insertMany(players);
    }

    console.log(`✅ Players sync completed: ${players.length} records updated`);
    
  } catch (error) {
    console.error('❌ Players synchronization failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Cron job chạy mỗi ngày lúc 01:40
const playerCronJob = cron.schedule('40 1 * * *', syncPlayers, {
  scheduled: false,
  timezone: 'Asia/Ho_Chi_Minh'
});

// Hàm khởi tạo và kiểm tra dữ liệu ban đầu
const initializePlayerCron = async () => {
  try {
    const count = await Player.countDocuments();
    if (count === 0) {
      console.log('👨‍💼 No players found, running initial sync...');
      await syncPlayers();
    } else {
      console.log(`👨‍💼 Found ${count} players in database`);
    }
    
    // Bắt đầu cron job sau khi kiểm tra
    playerCronJob.start();
    console.log('👨‍💼 Player cron job scheduled (runs daily at 01:40)');
  } catch (error) {
    console.error('❌ Error initializing player cron:', error.message);
    // Vẫn start cron job ngay cả khi có lỗi
    playerCronJob.start();
    console.log('👨‍💼 Player cron job scheduled (runs daily at 01:40)');
  }
};

module.exports = {
  playerCronJob,
  syncPlayers,
  initializePlayerCron
};
