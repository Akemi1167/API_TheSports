const cron = require('node-cron');
const axios = require('axios');
const Coach = require('../models/coach');

// Cấu hình API
const API_CONFIG = {
  baseURL: 'https://api.thesports.com/v1',
  user: 'abcvty',
  secret: '5b2bae3b821a03197c8caa3083098d78'
};

// Hàm đồng bộ dữ liệu coaches
const syncCoaches = async () => {
  try {
    console.log('🎯 Starting coaches synchronization...');
    
    let page = 1;
    let totalFetched = 0;
    let allCoaches = [];
    
    // Xoá toàn bộ dữ liệu cũ trước khi bắt đầu
    await Coach.deleteMany({});
    console.log('🗑️ Cleared all existing coach data');
    
    // Set để theo dõi IDs đã thấy để tránh duplicates
    const seenIds = new Set();
    
    // Lặp qua các trang cho đến khi không còn dữ liệu mới
    while (true) {
      try {
        console.log(`📄 Fetching page ${page}...`);
        
        // Gọi API để lấy dữ liệu coaches cho trang hiện tại
        const response = await axios.get(`${API_CONFIG.baseURL}/football/coach/list`, {
          params: {
            user: API_CONFIG.user,
            secret: API_CONFIG.secret,
            page: page
          },
          timeout: 30000
        });

        const coaches = response.data.results || [];
        console.log(`📡 Fetched ${coaches.length} coaches from page ${page}`);
        
        // Nếu không có dữ liệu thì kết thúc vòng lặp
        if (coaches.length === 0) {
          console.log(`ℹ️ No more data found on page ${page}, ending pagination`);
          break;
        }
        
        // Kiểm tra nếu tất cả IDs đều đã thấy trước đó (duplicate page)
        const newCoaches = coaches.filter(coach => !seenIds.has(coach.id));
        
        if (newCoaches.length === 0) {
          console.log(`ℹ️ All ${coaches.length} coaches on page ${page} are duplicates, ending pagination`);
          break;
        }
        
        // Thêm new IDs vào Set để tracking
        newCoaches.forEach(coach => seenIds.add(coach.id));
        
        // Thêm chỉ dữ liệu mới vào database
        if (newCoaches.length > 0) {
          await Coach.insertMany(newCoaches);
          allCoaches = allCoaches.concat(newCoaches);
          totalFetched += newCoaches.length;
        }
        
        console.log(`✅ Page ${page} processed: ${newCoaches.length} new coaches added (${coaches.length - newCoaches.length} duplicates skipped)`);
        
        // Nếu ít hơn dữ liệu mới so với total, có thể là trang cuối
        if (newCoaches.length < coaches.length * 0.5) {
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

    console.log(`✅ Coaches sync completed: ${totalFetched} total records from ${page - 1} pages`);
    
  } catch (error) {
    console.error('❌ Coaches synchronization failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Cron job chạy mỗi ngày lúc 01:50
const coachCronJob = cron.schedule('50 1 * * *', syncCoaches, {
  scheduled: false,
  timezone: 'Asia/Ho_Chi_Minh'
});

// Hàm khởi tạo và kiểm tra dữ liệu ban đầu
const initializeCoachCron = async () => {
  try {
    const count = await Coach.countDocuments();
    if (count === 0) {
      console.log('🎯 No coaches found, running initial sync...');
      await syncCoaches();
    } else {
      console.log(`🎯 Found ${count} coaches in database`);
    }
    
    // Bắt đầu cron job sau khi kiểm tra
    coachCronJob.start();
    console.log('🎯 Coach cron job scheduled (runs daily at 01:50)');
  } catch (error) {
    console.error('❌ Error initializing coach cron:', error.message);
    // Vẫn start cron job ngay cả khi có lỗi
    coachCronJob.start();
    console.log('🎯 Coach cron job scheduled (runs daily at 01:50)');
  }
};

module.exports = {
  coachCronJob,
  syncCoaches,
  initializeCoachCron
};
