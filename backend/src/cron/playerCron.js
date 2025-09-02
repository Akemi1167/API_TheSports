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
    
    let page = 1;
    let totalFetched = 0;
    let allPlayers = [];
    
    // Xoá toàn bộ dữ liệu cũ trước khi bắt đầu
    await Player.deleteMany({});
    console.log('🗑️ Cleared all existing player data');
    
    // Set để theo dõi IDs đã thấy để tránh duplicates
    const seenIds = new Set();
    
    // Lặp qua các trang cho đến khi không còn dữ liệu mới
    while (true) {
      try {
        console.log(`📄 Fetching page ${page}...`);
        
        // Gọi API để lấy dữ liệu players cho trang hiện tại
        const response = await axios.get(`${API_CONFIG.baseURL}/football/player/list`, {
          params: {
            user: API_CONFIG.user,
            secret: API_CONFIG.secret,
            page: page
          },
          timeout: 30000
        });

        const players = response.data.results || [];
        console.log(`📡 Fetched ${players.length} players from page ${page}`);
        
        // Nếu không có dữ liệu thì kết thúc vòng lặp
        if (players.length === 0) {
          console.log(`ℹ️ No more data found on page ${page}, ending pagination`);
          break;
        }
        
        // Kiểm tra nếu tất cả IDs đều đã thấy trước đó (duplicate page)
        const newPlayers = players.filter(player => !seenIds.has(player.id));
        
        if (newPlayers.length === 0) {
          console.log(`ℹ️ All ${players.length} players on page ${page} are duplicates, ending pagination`);
          break;
        }
        
        // Thêm new IDs vào Set để tracking
        newPlayers.forEach(player => seenIds.add(player.id));
        
        // Thêm chỉ dữ liệu mới vào database
        if (newPlayers.length > 0) {
          await Player.insertMany(newPlayers);
          allPlayers = allPlayers.concat(newPlayers);
          totalFetched += newPlayers.length;
        }
        
        console.log(`✅ Page ${page} processed: ${newPlayers.length} new players added (${players.length - newPlayers.length} duplicates skipped)`);
        
        // Nếu ít hơn dữ liệu mới so với total, có thể là trang cuối
        if (newPlayers.length < players.length * 0.5) {
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

    console.log(`✅ Players sync completed: ${totalFetched} total records from ${page - 1} pages`);
    
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
