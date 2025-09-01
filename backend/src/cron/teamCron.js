const cron = require('node-cron');
const axios = require('axios');
const Team = require('../models/team');

// Cấu hình API
const API_CONFIG = {
  baseURL: 'https://api.thesports.com/v1',
  user: 'abcvty',
  secret: '5b2bae3b821a03197c8caa3083098d78'
};

// Hàm đồng bộ dữ liệu teams
const syncTeams = async () => {
  try {
    console.log('⚽ Starting teams synchronization...');
    
    // Gọi API để lấy dữ liệu teams
    const response = await axios.get(`${API_CONFIG.baseURL}/football/team/additional/list`, {
      params: {
        user: API_CONFIG.user,
        secret: API_CONFIG.secret
      },
      timeout: 30000
    });

    const teams = response.data.results || [];
    console.log(`📡 Fetched ${teams.length} teams from API`);

    // Xoá toàn bộ dữ liệu cũ và insert mới
    await Team.deleteMany({});
    
    if (teams.length > 0) {
      await Team.insertMany(teams);
    }

    console.log(`✅ Teams sync completed: ${teams.length} records updated`);
    
  } catch (error) {
    console.error('❌ Teams synchronization failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Cron job chạy mỗi ngày lúc 01:30
const teamCronJob = cron.schedule('30 1 * * *', syncTeams, {
  scheduled: false,
  timezone: 'Asia/Ho_Chi_Minh'
});

// Hàm khởi tạo và kiểm tra dữ liệu ban đầu
const initializeTeamCron = async () => {
  try {
    const count = await Team.countDocuments();
    if (count === 0) {
      console.log('⚽ No teams found, running initial sync...');
      await syncTeams();
    } else {
      console.log(`⚽ Found ${count} teams in database`);
    }
    
    // Bắt đầu cron job sau khi kiểm tra
    teamCronJob.start();
    console.log('⚽ Team cron job scheduled (runs daily at 01:30)');
  } catch (error) {
    console.error('❌ Error initializing team cron:', error.message);
    // Vẫn start cron job ngay cả khi có lỗi
    teamCronJob.start();
    console.log('⚽ Team cron job scheduled (runs daily at 01:30)');
  }
};

module.exports = {
  teamCronJob,
  syncTeams,
  initializeTeamCron
};
