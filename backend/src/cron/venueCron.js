const cron = require('node-cron');
const axios = require('axios');
const Venue = require('../models/venue');

// Cấu hình API
const API_CONFIG = {
  baseURL: 'https://api.thesports.com/v1',
  user: 'abcvty',
  secret: '5b2bae3b821a03197c8caa3083098d78'
};

// Hàm đồng bộ dữ liệu venues
const syncVenues = async () => {
  try {
    console.log('🏟️ Starting venues synchronization...');
    
    let page = 1;
    let totalFetched = 0;
    let allVenues = [];
    
    // Xoá toàn bộ dữ liệu cũ trước khi bắt đầu
    await Venue.deleteMany({});
    console.log('🗑️ Cleared all existing venue data');
    
    // Set để theo dõi IDs đã thấy để tránh duplicates
    const seenIds = new Set();
    
    // Lặp qua các trang cho đến khi không còn dữ liệu mới
    while (true) {
      try {
        console.log(`📄 Fetching page ${page}...`);
        
        // Gọi API để lấy dữ liệu venues cho trang hiện tại
        const response = await axios.get(`${API_CONFIG.baseURL}/football/venue/list`, {
          params: {
            user: API_CONFIG.user,
            secret: API_CONFIG.secret,
            page: page
          },
          timeout: 30000
        });

        const venues = response.data.results || [];
        console.log(`📡 Fetched ${venues.length} venues from page ${page}`);
        
        // Nếu không có dữ liệu thì kết thúc vòng lặp
        if (venues.length === 0) {
          console.log(`ℹ️ No more data found on page ${page}, ending pagination`);
          break;
        }
        
        // Kiểm tra nếu tất cả IDs đều đã thấy trước đó (duplicate page)
        const newVenues = venues.filter(venue => !seenIds.has(venue.id));
        
        if (newVenues.length === 0) {
          console.log(`ℹ️ All ${venues.length} venues on page ${page} are duplicates, ending pagination`);
          break;
        }
        
        // Thêm new IDs vào Set để tracking
        newVenues.forEach(venue => seenIds.add(venue.id));
        
        // Thêm chỉ dữ liệu mới vào database
        if (newVenues.length > 0) {
          await Venue.insertMany(newVenues);
          allVenues = allVenues.concat(newVenues);
          totalFetched += newVenues.length;
        }
        
        console.log(`✅ Page ${page} processed: ${newVenues.length} new venues added (${venues.length - newVenues.length} duplicates skipped)`);
        
        // Nếu ít hơn dữ liệu mới so với total, có thể là trang cuối
        if (newVenues.length < venues.length * 0.5) {
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

    console.log(`✅ Venues sync completed: ${totalFetched} total records from ${page - 1} pages`);
    
  } catch (error) {
    console.error('❌ Venues synchronization failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Cron job chạy mỗi ngày lúc 02:10
const venueCronJob = cron.schedule('10 2 * * *', syncVenues, {
  scheduled: false,
  timezone: 'Asia/Ho_Chi_Minh'
});

// Hàm khởi tạo và kiểm tra dữ liệu ban đầu
const initializeVenueCron = async () => {
  try {
    const count = await Venue.countDocuments();
    if (count === 0) {
      console.log('🏟️ No venues found, running initial sync...');
      await syncVenues();
    } else {
      console.log(`🏟️ Found ${count} venues in database`);
    }
    
    // Bắt đầu cron job sau khi kiểm tra
    venueCronJob.start();
    console.log('🏟️ Venue cron job scheduled (runs daily at 02:10)');
  } catch (error) {
    console.error('❌ Error initializing venue cron:', error.message);
    // Vẫn start cron job ngay cả khi có lỗi
    venueCronJob.start();
    console.log('🏟️ Venue cron job scheduled (runs daily at 02:10)');
  }
};

module.exports = {
  venueCronJob,
  syncVenues,
  initializeVenueCron
};
