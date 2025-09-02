const cron = require('node-cron');
const axios = require('axios');
const HeadToHead = require('../models/headToHead');
const VideoStream = require('../models/videoStream');
const headToHeadService = require('../services/headToHeadService');

const THESPORTS_API_CONFIG = {
  baseURL: 'https://api.thesports.com',
  user: 'abcvty',
  secret: '5b2bae3b821a03197c8caa3083098d78'
};

// Sync head-to-head data from TheSports API
const syncHeadToHeadData = async () => {
  try {
    console.log('🔄 Starting head-to-head data sync...');
    
    // Lấy danh sách match_id từ VideoStream
    const videoStreams = await VideoStream.find({}, { match_id: 1 });
    console.log(`📺 Found ${videoStreams.length} video streams to sync head-to-head data`);
    
    if (videoStreams.length === 0) {
      console.log('ℹ️ No video streams found, skipping head-to-head sync');
      return;
    }
    
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalErrors = 0;
    
    // Xử lý từng match_id
    for (const stream of videoStreams) {
      try {
        console.log(`🔍 Syncing head-to-head data for match: ${stream.match_id}`);
        
        // API endpoint for head-to-head data (match analysis) với uuid parameter
        const response = await axios.get(`${THESPORTS_API_CONFIG.baseURL}/v1/football/match/analysis`, {
          params: {
            user: THESPORTS_API_CONFIG.user,
            secret: THESPORTS_API_CONFIG.secret,
            uuid: stream.match_id
          }
        });

        if (response.data && response.data.results) {
          const h2hDataArray = Array.isArray(response.data.results) ? response.data.results : [response.data.results];
          
          if (h2hDataArray.length > 0) {
            const result = await headToHeadService.createOrUpdateHeadToHead(h2hDataArray);
            
            if (result.success) {
              totalCreated += result.data.created;
              totalUpdated += result.data.updated;
              totalErrors += result.data.errors.length;
              
              console.log(`✅ Match ${stream.match_id} sync completed: ${result.data.created} created, ${result.data.updated} updated`);
              
              if (result.data.errors.length > 0) {
                console.warn(`⚠️ Errors for match ${stream.match_id}:`, result.data.errors);
              }
            } else {
              console.error(`❌ Match ${stream.match_id} sync failed:`, result.error);
              totalErrors++;
            }
          } else {
            console.log(`ℹ️ No head-to-head data available for match: ${stream.match_id}`);
          }
        } else {
          console.warn(`⚠️ Invalid response for match ${stream.match_id}:`, response.data);
        }
        
        // Thêm delay nhỏ để tránh spam API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error syncing match ${stream.match_id}:`, error.message);
        totalErrors++;
      }
    }
    
    console.log(`✅ Head-to-head data sync completed:`, {
      total_matches: videoStreams.length,
      created: totalCreated,
      updated: totalUpdated,
      errors: totalErrors,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error syncing head-to-head data:', error.message);
    
    // Log more details for debugging
    if (error.response) {
      console.error('API Response Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
  }
};

// Check if head-to-head data sync is needed (for smart initialization)
const checkHeadToHeadDataNeed = async () => {
  try {
    // Check if we have any recent head-to-head data
    const existingCount = await HeadToHead.countDocuments();
    
    if (existingCount > 0) {
      console.log(`ℹ️ Found ${existingCount} head-to-head records, cron will sync on schedule`);
      return true;
    }
    
    // No existing data, perform initial sync
    console.log('ℹ️ No head-to-head data found, performing initial sync');
    await syncHeadToHeadData();
    return true;
    
  } catch (error) {
    console.error('❌ Error checking head-to-head data need:', error.message);
    return false;
  }
};

// Initialize head-to-head data sync
const initializeHeadToHeadCron = async () => {
  try {
    console.log('🚀 Initializing head-to-head data sync system...');
    
    // Perform initial check and sync if needed
    await checkHeadToHeadDataNeed();
    
    // Schedule head-to-head data sync daily at 4 AM
    const syncTask = cron.schedule('0 4 * * *', async () => {
      await syncHeadToHeadData();
    }, {
      scheduled: false
    });
    
    // Schedule cleanup of old head-to-head data weekly on Sunday at 5 AM
    const cleanupTask = cron.schedule('0 5 * * 0', async () => {
      try {
        console.log('🧹 Starting head-to-head data cleanup...');
        
        // Delete head-to-head data older than 30 days for completed matches
        const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
        const result = await HeadToHead.deleteMany({
          last_updated: { $lt: thirtyDaysAgo },
          'info.match_status': { $in: [8, 9] } // Only delete completed/cancelled matches
        });
        
        console.log(`✅ Cleaned up ${result.deletedCount} old head-to-head records`);
      } catch (error) {
        console.error('❌ Error during head-to-head data cleanup:', error.message);
      }
    }, {
      scheduled: false
    });
    
    // Start the cron jobs
    syncTask.start();
    cleanupTask.start();
    
    console.log('✅ Head-to-head data cron jobs started:');
    console.log('   - Sync daily at 4 AM');
    console.log('   - Cleanup old data weekly on Sunday at 5 AM');
    
    // Store tasks for potential stopping
    global.headToHeadCronTasks = {
      sync: syncTask,
      cleanup: cleanupTask
    };
    
  } catch (error) {
    console.error('❌ Error initializing head-to-head data cron:', error.message);
  }
};

// Stop head-to-head data cron jobs (useful for testing or shutdown)
const stopHeadToHeadCron = () => {
  if (global.headToHeadCronTasks) {
    global.headToHeadCronTasks.sync.stop();
    global.headToHeadCronTasks.cleanup.stop();
    console.log('⏹️ Head-to-head data cron jobs stopped');
  }
};

// Sync specific team head-to-head data
const syncTeamHeadToHead = async (teamId) => {
  try {
    console.log(`🔄 Starting head-to-head sync for team: ${teamId}`);
    
    const response = await axios.get(`${THESPORTS_API_CONFIG.baseURL}/v1/football/match/analysis`, {
      params: {
        user: THESPORTS_API_CONFIG.user,
        secret: THESPORTS_API_CONFIG.secret,
        team_id: teamId
      }
    });

    if (response.data && response.data.results) {
      const h2hDataArray = Array.isArray(response.data.results) ? response.data.results : [response.data.results];
      const result = await headToHeadService.createOrUpdateHeadToHead(h2hDataArray);
      
      console.log(`✅ Team ${teamId} head-to-head sync completed:`, {
        created: result.data.created,
        updated: result.data.updated,
        errors: result.data.errors.length
      });
      
      return result;
    }
    
    return { success: false, error: 'No data from API' };
  } catch (error) {
    console.error(`❌ Error syncing team ${teamId} head-to-head:`, error.message);
    return { success: false, error: error.message };
  }
};

// Sync specific match head-to-head data by match_id
const syncMatchHeadToHead = async (matchId) => {
  try {
    console.log(`🔄 Starting head-to-head sync for match: ${matchId}`);
    
    const response = await axios.get(`${THESPORTS_API_CONFIG.baseURL}/v1/football/match/analysis`, {
      params: {
        user: THESPORTS_API_CONFIG.user,
        secret: THESPORTS_API_CONFIG.secret,
        uuid: matchId
      }
    });

    if (response.data && response.data.results) {
      const h2hDataArray = Array.isArray(response.data.results) ? response.data.results : [response.data.results];
      const result = await headToHeadService.createOrUpdateHeadToHead(h2hDataArray);
      
      console.log(`✅ Match ${matchId} head-to-head sync completed:`, {
        created: result.data.created,
        updated: result.data.updated,
        errors: result.data.errors.length
      });
      
      return result;
    }
    
    return { success: false, error: 'No data from API' };
  } catch (error) {
    console.error(`❌ Error syncing match ${matchId} head-to-head:`, error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  initializeHeadToHeadCron,
  stopHeadToHeadCron,
  syncHeadToHeadData,
  syncTeamHeadToHead,
  syncMatchHeadToHead,
  checkHeadToHeadDataNeed
};
