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
    
    let page = 1;
    let totalFetched = 0;
    let allTeams = [];
    
    // Xoá toàn bộ dữ liệu cũ trước khi bắt đầu
    await Team.deleteMany({});
    console.log('🗑️ Cleared all existing team data');
    
    // Set để theo dõi IDs đã thấy để tránh duplicates
    const seenIds = new Set();
    
    // Lặp qua các trang cho đến khi không còn dữ liệu mới
    while (true) {
      try {
        console.log(`📄 Fetching page ${page}...`);
        
        // Gọi API để lấy dữ liệu teams cho trang hiện tại
        const response = await axios.get(`${API_CONFIG.baseURL}/football/team/additional/list`, {
          params: {
            user: API_CONFIG.user,
            secret: API_CONFIG.secret,
            page: page
          },
          timeout: 30000
        });

        const teams = response.data.results || [];
        console.log(`📡 Fetched ${teams.length} teams from page ${page}`);
        
        // Nếu không có dữ liệu thì kết thúc vòng lặp
        if (teams.length === 0) {
          console.log(`ℹ️ No more data found on page ${page}, ending pagination`);
          break;
        }
        
        // Kiểm tra nếu tất cả IDs đều đã thấy trước đó (duplicate page)
        const newTeams = teams.filter(team => !seenIds.has(team.id));
        
        if (newTeams.length === 0) {
          console.log(`ℹ️ All ${teams.length} teams on page ${page} are duplicates, ending pagination`);
          break;
        }
        
        // Thêm new IDs vào Set để tracking
        newTeams.forEach(team => seenIds.add(team.id));
        
        // Thêm chỉ dữ liệu mới vào database
        if (newTeams.length > 0) {
          await Team.insertMany(newTeams);
          allTeams = allTeams.concat(newTeams);
          totalFetched += newTeams.length;
        }
        
        console.log(`✅ Page ${page} processed: ${newTeams.length} new teams added (${teams.length - newTeams.length} duplicates skipped)`);
        
        // Nếu ít hơn dữ liệu mới so với total, có thể là trang cuối
        if (newTeams.length < teams.length * 0.5) {
          console.log(`ℹ️ Less than 50% new data on page ${page}, likely reaching end of data`);
        }
        
        // Tăng page để lấy trang tiếp theo
        page++;
        
        // Thêm delay nhỏ để tránh spam API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (pageError) {
        console.error(`❌ Error fetching page ${page}:`, pageError.message);
        // Nếu có lỗi ở trang cụ thể, thử trang tiếp theo
        page++;
        
        // Nếu lỗi quá nhiều trang liên tiếp thì dừng
        if (page > 10 && totalFetched === 0) {
          console.error('❌ Too many failed pages, stopping pagination');
          break;
        }
      }
    }

    console.log(`✅ Teams sync completed: ${totalFetched} total records from ${page - 1} pages`);
    
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
