# Lineup System - Complete Implementation ✅

## 🏃‍♂️ Overview
Comprehensive single match lineup system với player incidents, formations, injuries, và detailed coordination data từ TheSports API.

## 📊 System Components

### 1. Lineup Model (`src/models/lineup.js`)
```javascript
- Complex nested schema với:
  - PlayerIncidentSchema (goals, cards, substitutions, assists)
  - PlayerLineupSchema (position, coordinates, rating, incidents)
  - InjuryDataSchema (injuries, suspensions, recovery time)
- Main fields: match_id, formations, coach_id, lineup{home/away}, injury{home/away}
- Coordinates: Home (upper-left origin), Away (lower-right origin)
- Player ratings: Max 10.0 scale
- Incident tracking: Real-time với assist và substitution data
```

### 2. Lineup Service (`src/services/lineupService.js`)
```javascript
- getLineupByMatchId() - Complete lineup data
- getStartingEleven() - Starting XI with formations
- getSubstitutes() - Bench players
- getPlayerInLineup() - Individual player data
- getMatchIncidents() - All incidents chronologically sorted
- getPlayerIncidents() - Player-specific incidents
- getInjuryData() - Injury/suspension status
- getCaptains() - Team captains identification
- getFormationAnalysis() - Statistical breakdown
- getLineupsByCoach() / getLineupsByPlayer() - Historical lookup
```

### 3. Lineup Controller (`src/controllers/lineupController.js`)
```javascript
- GET /lineups/match/:match_id - Full lineup data
- GET /lineups/match/:match_id/starting-eleven - Starting XI
- GET /lineups/match/:match_id/substitutes - Bench players
- GET /lineups/match/:match_id/player/:player_id - Player details
- GET /lineups/match/:match_id/incidents - All match incidents
- GET /lineups/match/:match_id/player/:player_id/incidents - Player incidents
- GET /lineups/match/:match_id/injuries - Injury/suspension data
- GET /lineups/match/:match_id/captains - Team captains
- GET /lineups/match/:match_id/formation-analysis - Formation stats
- GET /lineups/coach/:coach_id - Coach's lineup history
- GET /lineups/player/:player_id - Player's lineup history
- POST /lineups/sync - Manual synchronization
```

### 4. Lineup Routes (`src/routes/lineupRoutes.js`)
```javascript
- Complete Swagger documentation với detailed schemas
- PlayerIncident, PlayerLineup, InjuryData schema definitions
- Query parameters cho team filtering (home/away/both)
- Comprehensive response examples
- Error handling documentation
```

### 5. Lineup Cron Job (`src/cron/lineupCron.js`)
```javascript
- Schedule: Every 10 minutes (configurable)
- API endpoint: /lineup với match_id parameter
- Batch processing với rate limiting (100ms delay)
- 30-day match limit (API restriction)
- Incident parsing: Goals, cards, substitutions with full detail
- Error handling và retry logic
```

## 🎯 Key Features

### ⚽ Player Incidents Tracking:
- **Goals**: Với assist player tracking (assist1, assist2)
- **Cards**: Yellow/red cards với timing
- **Substitutions**: In/out player identification
- **Timing**: Precise minute + additional time (e.g., "45+2")
- **Score Context**: Home/away score when incident occurred

### 📐 Coordinate System:
- **Home Team**: Origin upper-left (x=right, y=down)
- **Away Team**: Origin lower-right (x=left, y=up)  
- **Range**: 0-100 for both X,Y coordinates
- **Formation**: String format (e.g., "4-4-2", "4-3-3")

### 🏥 Injury/Suspension System:
- **Type 0**: Unknown status
- **Type 1**: Injured
- **Type 2**: Suspended
- **Duration**: Start/end timestamps
- **Impact**: Missed matches count

### 👑 Player Roles:
- **Starting XI**: first=1 (xuất phát)
- **Substitutes**: first=0 (dự bị)
- **Captain**: captain=1 (đội trưởng)
- **Positions**: F=forward, M=midfielder, D=defender, G=goalkeeper

## 🔧 API Specifications

### Request Limits:
- **Rate**: 120 requests/minute
- **Data Range**: Matches within 30 days before today
- **Batch Size**: 50 matches per sync cycle

### Data Structure Compliance:
- Follows exact TheSports API format
- Array-based incident parsing
- Coordinate normalization (0-100 scale)
- Multi-language player name support

## 📊 Integration Status

### ✅ Successfully Integrated:
- App.js - Lineup routes và cron job initialized
- MongoDB - Lineup collection với indexes
- Swagger - Complete API documentation
- Error handling - Comprehensive validation
- Cron scheduling - 10-minute intervals

### 🔄 Cron Schedule Overview:
1. Teams - Daily 01:00
2. Matches - Daily 01:10  
3. Leagues - Daily 01:20
4. Countries - Daily 01:30
5. Players - Daily 01:40
6. Coaches - Daily 01:50
7. Referees - Daily 02:00
8. Venues - Daily 02:10
9. Seasons - Daily 02:20
10. Stages - Daily 02:30
11. Video Streams - Every minute
12. Real-time Data - Every 2 minutes
13. Head-to-Head - Daily 04:00
14. Standings - Every 5 minutes
15. **🏃‍♂️ Lineups - Every 10 minutes** ⭐

## ✅ Advanced Features

### 📈 Formation Analysis:
- Starting XI count per team
- Substitutes count
- Players by position breakdown
- Formation comparison

### 🔍 Historical Lookup:
- Coach lineup history
- Player appearance history
- Match-specific player performance

### ⚡ Real-time Updates:
- 10-minute sync intervals
- Incident real-time tracking
- Injury status updates

### 🎯 Query Flexibility:
- Team-specific filtering (home/away/both)
- Player-centric incident tracking
- Coach-based lineup analysis

## 🚀 Production Ready Features:
- Rate limiting compliance (120/min)
- 30-day data window respect
- Comprehensive error handling
- Detailed logging
- Swagger documentation
- MongoDB optimization với indexes
- Incident chronological sorting
- Coordinate system standardization

The Lineup System is **COMPLETE** and **PRODUCTION READY** với full player incident tracking, formation analysis, và real-time synchronization! 🏃‍♂️⚽

## 📱 Use Cases:
1. **Live Match Tracking**: Real-time lineup và incidents
2. **Formation Analysis**: Tactical breakdown và comparison
3. **Player Performance**: Individual incident tracking
4. **Injury Management**: Current status và recovery timeline
5. **Historical Analysis**: Coach/player lineup patterns
6. **Fantasy Sports**: Player rating và incident data
7. **Match Statistics**: Comprehensive incident timeline
