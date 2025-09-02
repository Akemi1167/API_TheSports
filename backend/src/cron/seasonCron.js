const cron = require('node-cron');
const axios = require('axios');
const Season = require('../models/season');

// Cấu hình API
const API_CONFIG = {
  baseURL: 'https://api.thesports.com/v1',
  user: 'abcvty',
  secret: '5b2bae3b821a03197c8caa3083098d78'
};

// Hàm đồng bộ dữ liệu seasons
const syncSeasons = async () => {
  try {
    console.log('📅 Starting seasons synchronization...');
    
    let page = 1;
    let totalFetched = 0;
    let allSeasons = [];
    
    // Xoá toàn bộ dữ liệu cũ trước khi bắt đầu
    await Season.deleteMany({});
    console.log('🗑️ Cleared all existing season data');
    
    // Set để theo dõi IDs đã thấy để tránh duplicates
    const seenIds = new Set();
    
    // Lặp qua các trang cho đến khi không còn dữ liệu mới
    while (true) {
      try {
        console.log(`📄 Fetching page ${page}...`);
        
        // Gọi API để lấy dữ liệu seasons cho trang hiện tại
        const response = await axios.get(`${API_CONFIG.baseURL}/football/season/list`, {
          params: {
            user: API_CONFIG.user,
            secret: API_CONFIG.secret,
            page: page
          },
          timeout: 30000
        });

        const seasons = response.data.results || [];
        console.log(`📡 Fetched ${seasons.length} seasons from page ${page}`);
        
        // Nếu không có dữ liệu thì kết thúc vòng lặp
        if (seasons.length === 0) {
          console.log(`ℹ️ No more data found on page ${page}, ending pagination`);
          break;
        }
        
        // Kiểm tra nếu tất cả IDs đều đã thấy trước đó (duplicate page)
        const newSeasons = seasons.filter(season => !seenIds.has(season.id));
        
        if (newSeasons.length === 0) {
          console.log(`ℹ️ All ${seasons.length} seasons on page ${page} are duplicates, ending pagination`);
          break;
        }
        
        // Thêm new IDs vào Set để tracking
        newSeasons.forEach(season => seenIds.add(season.id));
        
        // Thêm chỉ dữ liệu mới vào database
        if (newSeasons.length > 0) {
          await Season.insertMany(newSeasons);
          allSeasons = allSeasons.concat(newSeasons);
          totalFetched += newSeasons.length;
        }
        
        console.log(`✅ Page ${page} processed: ${newSeasons.length} new seasons added (${seasons.length - newSeasons.length} duplicates skipped)`);
        
        // Nếu ít hơn dữ liệu mới so với total, có thể là trang cuối
        if (newSeasons.length < seasons.length * 0.5) {
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

    console.log(`✅ Seasons sync completed: ${totalFetched} total records from ${page - 1} pages`);
    
  } catch (error) {
    console.error('❌ Seasons synchronization failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Cron job chạy mỗi ngày lúc 02:20
const seasonCronJob = cron.schedule('20 2 * * *', syncSeasons, {
  scheduled: false,
  timezone: 'Asia/Ho_Chi_Minh'
});

// Hàm khởi tạo và kiểm tra dữ liệu ban đầu
const initializeSeasonCron = async () => {
  try {
    const count = await Season.countDocuments();
    if (count === 0) {
      console.log('📅 No seasons found, running initial sync...');
      await syncSeasons();
    } else {
      console.log(`📅 Found ${count} seasons in database`);
    }
    
    // Bắt đầu cron job sau khi kiểm tra
    seasonCronJob.start();
    console.log('📅 Season cron job scheduled (runs daily at 02:20)');
  } catch (error) {
    console.error('❌ Error initializing season cron:', error.message);
    // Vẫn start cron job ngay cả khi có lỗi
    seasonCronJob.start();
    console.log('📅 Season cron job scheduled (runs daily at 02:20)');
  }
};

module.exports = {
  seasonCronJob,
  syncSeasons,
  initializeSeasonCron
};
