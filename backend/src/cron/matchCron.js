const cron = require('node-cron');
const RecentMatchService = require('../services/recentMatchService');

// Create singleton instance for consistent state management
const recentMatchService = new RecentMatchService();

/**
 * Sync matches from TheSports API using recent matches endpoint
 * Implements full sync (first time) and incremental sync (subsequent)
 */
const syncMatches = async () => {
  try {
    console.log('🏃‍♂️ Starting matches synchronization...');
    
    // Use recent matches API with proper full/incremental logic
    await recentMatchService.syncRecentMatches({
      // Optional parameters - can be added based on needs
      // season_id: 'specific_season',
      // comp_id: 'specific_competition'
    });
    
    // Get and log sync statistics
    const stats = await recentMatchService.getSyncStats();
    if (stats) {
      console.log('📊 Sync Statistics:');
      console.log(`   Total matches in DB: ${stats.total_matches}`);
      console.log(`   Recent updates (24h): ${stats.recent_updates}`);
      console.log(`   Last sync time: ${stats.last_sync_time}`);
      console.log(`   Is initial sync: ${stats.is_initial_sync}`);
    }
    
    console.log('✅ Matches synchronization completed');
    
  } catch (error) {
    console.error('❌ Matches synchronization failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
};

/**
 * Initialize matches with full data sync on first run
 */
const performInitialSync = async () => {
  console.log('🏃‍♂️ Starting initial full sync - will automatically paginate through all data...');
  
  try {
    // Force initial sync mode - this will handle pagination automatically
    recentMatchService.isInitialSync = true;
    
    const result = await recentMatchService.syncRecentMatches();
    
    if (result) {
      console.log(`✅ Initial sync completed: ${result.syncedCount} matches synced across ${result.pagesProcessed || 'unknown'} pages`);
    } else {
      console.log('✅ Initial sync completed with no return data');
    }
    
  } catch (error) {
    console.error('❌ Initial sync failed:', error.message);
    recentMatchService.isInitialSync = false;
  }
};

/**
 * Initialize matches cron jobs
 */
const initializeMatchesCron = async () => {
  console.log('🏃‍♂️ Initializing matches cron jobs...');
  
  // Check if there are any matches in database
  const Match = require('../models/match');
  
  try {
    const count = await Match.countDocuments();
    
    if (count === 0) {
      console.log('🏃‍♂️ No matches found, running initial full sync...');
      await performInitialSync();
    } else {
      console.log(`🏃‍♂️ Found ${count} matches in database, skipping initial sync`);
      // Ensure we're not in initial sync mode for existing data
      recentMatchService.isInitialSync = false;
    }
  } catch (error) {
    console.error('❌ Error checking matches count:', error.message);
  }
  
  // Schedule cron jobs
  
  // Incremental sync every 5 seconds for real-time updates
  cron.schedule('*/5 * * * * *', () => {
    console.log('⏰ Running scheduled incremental matches sync (every 5 seconds)...');
    syncMatches();
  });
  
  // Full sync once daily at 3 AM (for data consistency)
  cron.schedule('0 3 * * *', async () => {
    console.log('🌙 Running daily full matches sync (3 AM)...');
    await performInitialSync();
  });
  
  console.log('🏃‍♂️ Matches cron jobs scheduled:');
  console.log('   - Incremental sync: every 5 seconds');
  console.log('   - Full sync: daily at 3 AM');
  
  return {
    syncMatches,
    performInitialSync
  };
};

module.exports = {
  syncMatches,
  initializeMatchesCron,
  performInitialSync
};