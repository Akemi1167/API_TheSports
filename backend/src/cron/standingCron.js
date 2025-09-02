const cron = require('node-cron');
const axios = require('axios');
const Standing = require('../models/standing');

// Cấu hình API
const API_CONFIG = {
  baseURL: 'https://api.thesports.com/v1',
  user: 'abcvty',
  secret: '5b2bae3b821a03197c8caa3083098d78'
};

// Hàm đồng bộ dữ liệu standings
const syncStandings = async () => {
  try {
    console.log('🏆 Starting standings synchronization...');
    
    let page = 1;
    let totalFetched = 0;
    let allStandings = [];
    
    // Set để theo dõi season_ids đã thấy để tránh duplicates
    const seenSeasonIds = new Set();
    
    // Lặp qua các trang cho đến khi không còn dữ liệu mới
    while (true) {
      try {
        console.log(`📄 Fetching page ${page}...`);
        
        // Gọi API để lấy dữ liệu standings cho trang hiện tại
        const response = await axios.get(`${API_CONFIG.baseURL}/football/table/live`, {
          params: {
            user: API_CONFIG.user,
            secret: API_CONFIG.secret,
            page: page
          },
          timeout: 30000
        });

        const standings = response.data.results || [];
        console.log(`📡 Fetched ${standings.length} standings from page ${page}`);
        
        // Nếu không có dữ liệu thì kết thúc vòng lặp
        if (standings.length === 0) {
          console.log(`ℹ️ No more data found on page ${page}, ending pagination`);
          break;
        }
        
        // Kiểm tra nếu tất cả season_ids đều đã thấy trước đó (duplicate page)
        const newStandings = standings.filter(standing => !seenSeasonIds.has(standing.season_id));
        
        if (newStandings.length === 0) {
          console.log(`ℹ️ All ${standings.length} standings on page ${page} are duplicates, ending pagination`);
          break;
        }
        
        // Thêm new season_ids vào Set để tracking
        newStandings.forEach(standing => seenSeasonIds.add(standing.season_id));
        
        // Xử lý và lưu chỉ dữ liệu mới vào database
        let processedCount = 0;
        let errorCount = 0;
        
        for (const standingData of newStandings) {
          try {
            // Chuẩn bị dữ liệu standing theo format model
            const formattedStanding = {
              season_id: standingData.season_id,
              promotions: standingData.promotions || [],
              tables: standingData.tables || [],
              updated_at: standingData.updated_at || Date.now(),
              data_source: 'TheSports API'
            };
            
            // Upsert vào database
            await Standing.findOneAndUpdate(
              { season_id: standingData.season_id },
              formattedStanding,
              { upsert: true, new: true, runValidators: true }
            );
            
            processedCount++;
          } catch (error) {
            console.error(`❌ Error processing standing ${standingData.season_id}:`, error.message);
            errorCount++;
          }
        }
        
        allStandings = allStandings.concat(newStandings);
        totalFetched += processedCount;
        
        console.log(`✅ Page ${page} processed: ${processedCount} standings saved, ${errorCount} errors (${standings.length - newStandings.length} duplicates skipped)`);
        
        // Nếu ít hơn dữ liệu mới so với total, có thể là trang cuối
        if (newStandings.length < standings.length * 0.5) {
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

    console.log(`✅ Standings sync completed: ${totalFetched} total records from ${page - 1} pages`);
    
  } catch (error) {
    console.error('❌ Standings synchronization failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

// Cron job chạy mỗi 5 phút
const standingCronJob = cron.schedule('*/5 * * * *', syncStandings, {
  scheduled: false,
  timezone: 'Asia/Ho_Chi_Minh'
});

// Hàm khởi tạo và kiểm tra dữ liệu ban đầu
const initializeStandingCron = async () => {
  try {
    const count = await Standing.countDocuments();
    if (count === 0) {
      console.log('🏆 No standings found, running initial sync...');
      await syncStandings();
    } else {
      console.log(`🏆 Found ${count} standings in database`);
    }
    
    // Bắt đầu cron job sau khi kiểm tra
    standingCronJob.start();
    console.log('🏆 Standing cron job scheduled (runs every 5 minutes)');
  } catch (error) {
    console.error('❌ Error initializing standing cron:', error.message);
    // Vẫn start cron job ngay cả khi có lỗi
    standingCronJob.start();
    console.log('🏆 Standing cron job scheduled (runs every 5 minutes)');
  }
};

module.exports = {
  standingCronJob,
  syncStandings,
  initializeStandingCron
};
