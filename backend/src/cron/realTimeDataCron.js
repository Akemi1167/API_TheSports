const cron = require('node-cron');
const axios = require('axios');
const RealTimeData = require('../models/realTimeData');
const realTimeDataService = require('../services/realTimeDataService');

const THESPORTS_API_CONFIG = {
  baseURL: 'https://api.thesports.com',
  user: 'abcvty',
  secret: '5b2bae3b821a03197c8caa3083098d78'
};

// Sync real-time data from TheSports API
const syncRealTimeData = async () => {
  try {
    console.log('🔄 Starting real-time data sync...');
    
    const response = await axios.get(`${THESPORTS_API_CONFIG.baseURL}/v1/football/match/detail_live`, {
      params: {
        user: THESPORTS_API_CONFIG.user,
        secret: THESPORTS_API_CONFIG.secret
      }
    });

    if (response.data && response.data.results) {
      const realTimeDataArray = response.data.results;
      
      if (realTimeDataArray.length > 0) {
        const result = await realTimeDataService.createOrUpdateRealTimeData(realTimeDataArray);
        
        if (result.success) {
          console.log(`✅ Real-time data sync completed:`, {
            created: result.data.created,
            updated: result.data.updated,
            errors: result.data.errors.length,
            total_processed: result.data.created + result.data.updated,
            timestamp: new Date().toISOString()
          });
          
          if (result.data.errors.length > 0) {
            console.warn('⚠️ Some errors occurred during sync:', result.data.errors);
          }
        } else {
          console.error('❌ Real-time data sync failed:', result.error);
        }
      } else {
        console.log('ℹ️ No real-time data available from API');
      }
    } else {
      console.warn('⚠️ Invalid response from TheSports API:', response.data);
    }
  } catch (error) {
    console.error('❌ Error syncing real-time data:', error.message);
    
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

// Check if real-time data sync is needed (for smart initialization)
const checkRealTimeDataNeed = async () => {
  try {
    // Check if we have any recent real-time data (within last 5 minutes)
    const recentDataResult = await realTimeDataService.getRecentlyUpdated(5);
    
    if (recentDataResult.success && recentDataResult.data.length > 0) {
      console.log('ℹ️ Recent real-time data found, cron will sync on schedule');
      return true; // Has recent data, cron will handle updates
    }
    
    // Check if we have any live matches
    const liveMatchesResult = await realTimeDataService.getLiveMatches();
    
    if (liveMatchesResult.success && liveMatchesResult.data.length > 0) {
      console.log('ℹ️ Live matches found, performing immediate sync');
      await syncRealTimeData();
      return true;
    }
    
    // No recent data or live matches, perform initial sync
    console.log('ℹ️ No recent real-time data found, performing initial sync');
    await syncRealTimeData();
    return true;
    
  } catch (error) {
    console.error('❌ Error checking real-time data need:', error.message);
    return false;
  }
};

// Initialize real-time data sync
const initializeRealTimeDataCron = async () => {
  try {
    console.log('🚀 Initializing real-time data sync system...');
    
    // Perform initial check and sync if needed
    await checkRealTimeDataNeed();
    
    // Schedule real-time data sync every 2 seconds for live updates
    const realTimeTask = cron.schedule('*/2 * * * * *', async () => {
      await syncRealTimeData();
    }, {
      scheduled: false
    });
    
    // Schedule cleanup of old real-time data daily at 3 AM
    const cleanupTask = cron.schedule('0 3 * * *', async () => {
      try {
        console.log('🧹 Starting real-time data cleanup...');
        
        // Delete real-time data older than 7 days
        const sevenDaysAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
        const result = await RealTimeData.deleteMany({
          last_updated: { $lt: sevenDaysAgo },
          is_live: false
        });
        
        console.log(`✅ Cleaned up ${result.deletedCount} old real-time records`);
      } catch (error) {
        console.error('❌ Error during real-time data cleanup:', error.message);
      }
    }, {
      scheduled: false
    });
    
    // Start the cron jobs
    realTimeTask.start();
    cleanupTask.start();
    
    console.log('✅ Real-time data cron jobs started:');
    console.log('   - Sync every 2 seconds for live updates');
    console.log('   - Cleanup old data daily at 3 AM');
    
    // Store tasks for potential stopping
    global.realTimeDataCronTasks = {
      sync: realTimeTask,
      cleanup: cleanupTask
    };
    
  } catch (error) {
    console.error('❌ Error initializing real-time data cron:', error.message);
  }
};

// Stop real-time data cron jobs (useful for testing or shutdown)
const stopRealTimeDataCron = () => {
  if (global.realTimeDataCronTasks) {
    global.realTimeDataCronTasks.sync.stop();
    global.realTimeDataCronTasks.cleanup.stop();
    console.log('⏹️ Real-time data cron jobs stopped');
  }
};

module.exports = {
  initializeRealTimeDataCron,
  stopRealTimeDataCron,
  syncRealTimeData,
  checkRealTimeDataNeed
};
