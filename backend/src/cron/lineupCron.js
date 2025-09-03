const cron = require('node-cron');
const axios = require('axios');
const Lineup = require('../models/lineup');
const { API_CONFIG } = require('../config/api');

// Lineup Sync Configuration
const SYNC_CONFIG = {
  API_ENDPOINT: '/lineup',
  CRON_SCHEDULE: '*/10 * * * *', // Every 10 minutes
  REQUEST_DELAY: 100, // 100ms between requests
  MAX_RETRIES: 3,
  BATCH_SIZE: 50
};

/**
 * Parse lineup data từ TheSports API response
 * @param {Object} lineupData - Raw lineup data from API
 * @param {string} matchId - Match ID
 * @returns {Object} Parsed lineup data
 */
function parseLineupData(lineupData, matchId) {
  try {
    const parsePlayer = (playerArray) => {
      if (!Array.isArray(playerArray) || playerArray.length < 8) {
        return null;
      }
      
      const incidents = [];
      // Parse incidents if they exist (index 8+)
      if (playerArray[8] && Array.isArray(playerArray[8])) {
        playerArray[8].forEach(incidentArray => {
          if (Array.isArray(incidentArray) && incidentArray.length >= 6) {
            const incident = {
              type: incidentArray[0] || 0,
              time: incidentArray[1] || '',
              minute: incidentArray[2] || 0,
              addtime: incidentArray[3] || 0,
              belong: incidentArray[4] || 0,
              home_score: incidentArray[5] || 0,
              away_score: incidentArray[6] || 0
            };
            
            // Additional incident data based on type
            if (incidentArray.length > 7) {
              const extraData = incidentArray[7];
              if (extraData && Array.isArray(extraData)) {
                if (extraData[0]) {
                  incident.player = {
                    id: extraData[0][0] || '',
                    name: extraData[0][1] || ''
                  };
                }
                if (extraData[1]) {
                  incident.assist1 = {
                    id: extraData[1][0] || '',
                    name: extraData[1][1] || ''
                  };
                }
                if (extraData[2]) {
                  incident.assist2 = {
                    id: extraData[2][0] || '',
                    name: extraData[2][1] || ''
                  };
                }
                if (extraData[3]) {
                  incident.in_player = {
                    id: extraData[3][0] || '',
                    name: extraData[3][1] || ''
                  };
                }
                if (extraData[4]) {
                  incident.out_player = {
                    id: extraData[4][0] || '',
                    name: extraData[4][1] || ''
                  };
                }
              }
            }
            
            incidents.push(incident);
          }
        });
      }
      
      return {
        id: playerArray[0] || '',
        first: playerArray[1] || 0,
        captain: playerArray[2] || 0,
        name: playerArray[3] || '',
        logo: playerArray[4] || '',
        shirt_number: playerArray[5] || 0,
        position: playerArray[6] || '',
        x: playerArray[7] || 0,
        y: playerArray[8] || 0,
        rating: playerArray[9] || '',
        incidents: incidents
      };
    };
    
    const parseInjury = (injuryArray) => {
      if (!Array.isArray(injuryArray) || injuryArray.length < 8) {
        return null;
      }
      
      return {
        id: injuryArray[0] || '',
        name: injuryArray[1] || '',
        position: injuryArray[2] || '',
        logo: injuryArray[3] || '',
        type: injuryArray[4] || 0,
        reason: injuryArray[5] || '',
        start_time: injuryArray[6] || 0,
        end_time: injuryArray[7] || 0,
        missed_matches: injuryArray[8] || 0
      };
    };

    const parsedData = {
      match_id: matchId,
      confirmed: lineupData.confirmed || 0,
      home_formation: lineupData.home_formation || '',
      away_formation: lineupData.away_formation || '',
      coach_id: {
        home: lineupData.coach_id?.home || '',
        away: lineupData.coach_id?.away || ''
      },
      lineup: {
        home: [],
        away: []
      },
      injury: {
        home: [],
        away: []
      },
      last_updated: Math.floor(Date.now() / 1000),
      data_source: 'thesports_api'
    };

    // Parse home lineup
    if (lineupData.lineup?.home && Array.isArray(lineupData.lineup.home)) {
      lineupData.lineup.home.forEach(playerData => {
        const player = parsePlayer(playerData);
        if (player) {
          parsedData.lineup.home.push(player);
        }
      });
    }

    // Parse away lineup
    if (lineupData.lineup?.away && Array.isArray(lineupData.lineup.away)) {
      lineupData.lineup.away.forEach(playerData => {
        const player = parsePlayer(playerData);
        if (player) {
          parsedData.lineup.away.push(player);
        }
      });
    }

    // Parse home injuries
    if (lineupData.injury?.home && Array.isArray(lineupData.injury.home)) {
      lineupData.injury.home.forEach(injuryData => {
        const injury = parseInjury(injuryData);
        if (injury) {
          parsedData.injury.home.push(injury);
        }
      });
    }

    // Parse away injuries
    if (lineupData.injury?.away && Array.isArray(lineupData.injury.away)) {
      lineupData.injury.away.forEach(injuryData => {
        const injury = parseInjury(injuryData);
        if (injury) {
          parsedData.injury.away.push(injury);
        }
      });
    }

    return parsedData;
  } catch (error) {
    console.error('❌ Error parsing lineup data:', error);
    return null;
  }
}

/**
 * Fetch lineup data từ TheSports API
 * @param {string} matchId - Match ID
 * @returns {Object|null} Lineup data hoặc null nếu error
 */
async function fetchLineupData(matchId) {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}${SYNC_CONFIG.API_ENDPOINT}`, {
      params: {
        ...API_CONFIG.DEFAULT_PARAMS,
        match_id: matchId
      },
      timeout: API_CONFIG.TIMEOUT
    });

    if (response.data && response.data.data) {
      return parseLineupData(response.data.data, matchId);
    }

    return null;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`ℹ️ No lineup found for match ${matchId}`);
    } else {
      console.error(`❌ Error fetching lineup for match ${matchId}:`, error.message);
    }
    return null;
  }
}

/**
 * Sync lineup data for multiple matches
 * @param {Array} matchIds - Array of match IDs
 * @returns {Object} Sync results
 */
async function syncLineupsBatch(matchIds) {
  const results = {
    processed: 0,
    created: 0,
    updated: 0,
    errors: 0,
    errorDetails: []
  };

  for (const matchId of matchIds) {
    try {
      results.processed++;
      
      console.log(`🔄 Processing lineup for match: ${matchId}`);
      
      const lineupData = await fetchLineupData(matchId);
      
      if (lineupData) {
        const existingLineup = await Lineup.findOne({ match_id: matchId });
        
        if (existingLineup) {
          // Update existing lineup
          Object.assign(existingLineup, lineupData);
          await existingLineup.save();
          results.updated++;
          console.log(`✅ Updated lineup for match: ${matchId}`);
        } else {
          // Create new lineup
          const newLineup = new Lineup(lineupData);
          await newLineup.save();
          results.created++;
          console.log(`✅ Created lineup for match: ${matchId}`);
        }
      } else {
        console.log(`ℹ️ No lineup data for match: ${matchId}`);
      }
      
      // Rate limiting delay
      if (SYNC_CONFIG.REQUEST_DELAY > 0) {
        await new Promise(resolve => setTimeout(resolve, SYNC_CONFIG.REQUEST_DELAY));
      }
      
    } catch (error) {
      results.errors++;
      const errorMsg = `Error processing match ${matchId}: ${error.message}`;
      results.errorDetails.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  return results;
}

/**
 * Get recent match IDs that might have lineup data
 * @returns {Array} Array of match IDs
 */
async function getRecentMatchIds() {
  try {
    // Get matches from last 30 days (as per API limit)
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    
    // This would typically come from your matches collection
    // For now, we'll simulate getting match IDs
    // In production, you'd query your matches database
    
    console.log('🔍 Getting recent match IDs for lineup sync...');
    
    // Placeholder - replace with actual match query
    const recentMatches = [
      'sample_match_1',
      'sample_match_2', 
      'sample_match_3'
    ];
    
    return recentMatches.slice(0, SYNC_CONFIG.BATCH_SIZE);
  } catch (error) {
    console.error('❌ Error getting recent match IDs:', error);
    return [];
  }
}

/**
 * Main sync function
 */
async function syncLineups() {
  try {
    console.log('🏃‍♂️ Starting lineup synchronization...');
    const startTime = Date.now();
    
    const matchIds = await getRecentMatchIds();
    
    if (matchIds.length === 0) {
      console.log('ℹ️ No recent matches found for lineup sync');
      return;
    }
    
    console.log(`📋 Found ${matchIds.length} matches to sync lineups`);
    
    const results = await syncLineupsBatch(matchIds);
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('🏁 Lineup synchronization completed!');
    console.log(`📊 Results: ${results.processed} processed, ${results.created} created, ${results.updated} updated, ${results.errors} errors`);
    console.log(`⏱️ Duration: ${duration}s`);
    
    if (results.errors > 0) {
      console.log('❌ Errors:', results.errorDetails);
    }
    
  } catch (error) {
    console.error('❌ Lineup sync failed:', error);
  }
}

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
  lineupCronJob,
  SYNC_CONFIG,
  fetchLineupData,
  parseLineupData
};
