const cron = require('node-cron');
const VideoStream = require('../models/videoStream');
const lineupService = require('../services/lineupService');

// Lineup Sync Configuration
const SYNC_CONFIG = {
  CRON_SCHEDULE: '0 * * * * *', // Every 1 minute
  BATCH_SIZE: 50
};

// Get recent match IDs from videoStream collection
const getRecentMatchIds = async () => {
  try {
    console.log('🔍 Getting match IDs from videoStream collection...');
    
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
    const twentyFourHoursFromNow = now + (24 * 60 * 60);
    
    const videoStreams = await VideoStream.find({
      match_time: {
        $gte: thirtyDaysAgo,
        $lte: twentyFourHoursFromNow
      },
      sport_id: 1 // Only football matches
    })
    .select('match_id match_time home away comp')
    .sort({ match_time: -1 })
    .limit(SYNC_CONFIG.BATCH_SIZE);
    
    const matchIds = videoStreams.map(stream => stream.match_id);
    
    console.log(`📋 Found ${matchIds.length} football matches for lineup sync`);
    
    return matchIds;
  } catch (error) {
    console.error('❌ Error getting match IDs from videoStream:', error.message);
    return [];
  }
};

// Hàm đồng bộ dữ liệu lineups - following service layer pattern
const syncLineups = async () => {
  try {
    console.log('🏃‍♂️ Starting lineup synchronization...');
    const startTime = Date.now();
    
    // Lấy danh sách match IDs từ videoStream
    const matchIds = await getRecentMatchIds();
    
    if (matchIds.length === 0) {
      console.log('ℹ️ No recent matches found for lineup sync');
      return {
        success: true,
        data: { processed: 0, created: 0, updated: 0, errors: 0 }
      };
    }
    
    console.log(`📋 Syncing lineups for ${matchIds.length} matches using service layer...`);
    
    // Use service layer for batch sync
    const result = await lineupService.syncLineupsBatch(matchIds);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (result.success) {
      console.log('🏁 Lineup synchronization completed!');
      console.log(`📊 Results: ${result.data.processed} processed, ${result.data.created} created, ${result.data.updated} updated, ${result.data.errors} errors`);
      console.log(`⏱️ Duration: ${duration}s`);
      
      // Add timing information
      result.data.duration = duration;
      result.data.timestamp = new Date().toISOString();
      
      if (result.data.errors > 0) {
        console.warn('⚠️ Some errors occurred during sync:', result.data.errorDetails);
      }
    } else {
      console.error('❌ Lineup sync failed:', result.error);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Lineup sync failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Get live match IDs from videoStream collection for priority lineup sync
const getLiveMatchIds = async () => {
  try {
    console.log('🔴 Getting live match IDs from videoStream for priority lineup sync...');
    
    const now = Math.floor(Date.now() / 1000);
    const twoHoursAgo = now - (2 * 60 * 60);
    const oneHourFromNow = now + (1 * 60 * 60);
    
    const liveStreams = await VideoStream.find({
      match_time: {
        $gte: twoHoursAgo,
        $lte: oneHourFromNow
      },
      sport_id: 1 // Only football matches
    })
    .select('match_id match_time home away comp')
    .sort({ match_time: 1 });
    
    const liveMatchIds = liveStreams.map(stream => stream.match_id);
    
    console.log(`🔴 Found ${liveMatchIds.length} potentially live football matches for priority lineup sync`);
    
    return liveMatchIds;
  } catch (error) {
    console.error('❌ Error getting live match IDs from videoStream:', error.message);
    return [];
  }
};

// Sync lineups for live matches with priority
const syncLiveLineups = async () => {
  try {
    console.log('🔴 Starting priority lineup sync for live matches...');
    const startTime = Date.now();
    
    const liveMatchIds = await getLiveMatchIds();
    
    if (liveMatchIds.length === 0) {
      console.log('ℹ️ No live matches found for priority lineup sync');
      return {
        success: true,
        data: { processed: 0, created: 0, updated: 0, errors: 0 }
      };
    }
    
    // Use service layer for batch sync
    const result = await lineupService.syncLineupsBatch(liveMatchIds);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    if (result.success) {
      console.log('🏁 Live lineup synchronization completed!');
      console.log(`📊 Results: ${result.data.processed} processed, ${result.data.created} created, ${result.data.updated} updated, ${result.data.errors} errors`);
      console.log(`⏱️ Duration: ${duration}s`);
      
      if (result.data.errors > 0) {
        console.warn('⚠️ Some errors occurred during live sync:', result.data.errorDetails);
      }
    } else {
      console.error('❌ Live lineup sync failed:', result.error);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Live lineup sync failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Schedule lineup sync cron job
const lineupCronJob = cron.schedule(SYNC_CONFIG.CRON_SCHEDULE, async () => {
  console.log(`🕒 Lineup sync cron triggered at ${new Date().toISOString()}`);
  await syncLineups();
}, {
  scheduled: false,
  timezone: 'UTC'
});

// Export functions for manual use
module.exports = {
  syncLineups,
  syncLiveLineups,
  lineupCronJob,
  SYNC_CONFIG,
  getRecentMatchIds,
  getLiveMatchIds
};
