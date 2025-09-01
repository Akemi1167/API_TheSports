const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TheSports API',
      version: '1.0.0',
      description: 'API for TheSports football data',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        Category: {
          type: 'object',
          description: 'Football category information',
          required: ['id', 'name', 'updated_at'],
          properties: {
            id: { 
              type: 'string', 
              description: 'Unique category identifier',
              example: '1'
            },
            name: { 
              type: 'string', 
              description: 'Category name (e.g., Football, Basketball)',
              example: 'Football'
            },
            updated_at: { 
              type: 'integer', 
              description: 'Last update timestamp (Unix timestamp)',
              example: 1693555200
            }
          }
        },
        Country: {
          type: 'object',
          description: 'Country information for football competitions',
          required: ['id', 'category_id', 'name', 'logo', 'updated_at'],
          properties: {
            id: { 
              type: 'string', 
              description: 'Unique country identifier',
              example: 'c1'
            },
            category_id: { 
              type: 'string', 
              description: 'Reference to category this country belongs to',
              example: '1'
            },
            name: { 
              type: 'string', 
              description: 'Country name',
              example: 'England'
            },
            logo: { 
              type: 'string', 
              description: 'URL to country flag/logo image',
              example: 'https://example.com/flags/england.png'
            },
            updated_at: { 
              type: 'integer', 
              description: 'Last update timestamp (Unix timestamp)',
              example: 1693555200
            }
          }
        },
        Competition: {
          type: 'object',
          description: 'Football competition/league information',
          required: ['id', 'category_id', 'country_id', 'name', 'short_name', 'logo', 'type', 'updated_at'],
          properties: {
            id: { 
              type: 'string', 
              description: 'Unique competition identifier',
              example: 'comp1'
            },
            category_id: { 
              type: 'string', 
              description: 'Reference to category',
              example: '1'
            },
            country_id: { 
              type: 'string', 
              description: 'Reference to country hosting the competition',
              example: 'c1'
            },
            name: { 
              type: 'string', 
              description: 'Full competition name',
              example: 'Premier League'
            },
            short_name: { 
              type: 'string', 
              description: 'Competition abbreviation',
              example: 'EPL'
            },
            logo: { 
              type: 'string', 
              description: 'URL to competition logo',
              example: 'https://example.com/logos/premier-league.png'
            },
            type: { 
              type: 'integer', 
              description: 'Competition type: 0-unknown, 1-league, 2-cup, 3-friendly',
              example: 1,
              enum: [0, 1, 2, 3]
            },
            cur_season_id: { 
              type: 'string', 
              description: 'Current active season ID',
              example: 'season2023'
            },
            cur_stage_id: { 
              type: 'string', 
              description: 'Current active stage ID',
              example: 'stage1'
            },
            cur_round: { 
              type: 'integer', 
              description: 'Current round number',
              example: 15
            },
            round_count: { 
              type: 'integer', 
              description: 'Total number of rounds in competition',
              example: 38
            },
            title_holder: { 
              type: 'array', 
              description: 'Defending champion team info [team_id, championships_count]',
              items: {},
              example: ['team123', 6]
            },
            most_titles: { 
              type: 'array', 
              description: 'Team with most titles [[team_ids], titles_count]',
              items: {},
              example: [['team123'], 20]
            },
            newcomers: { 
              type: 'array', 
              description: 'Promoted/relegated teams [[promoted], [relegated]]',
              items: {}
            },
            divisions: { 
              type: 'array', 
              description: 'Competition hierarchy [[higher_level], [lower_level]]',
              items: {}
            },
            host: { 
              type: 'object',
              description: 'Host location information',
              properties: {
                country: { type: 'string', description: 'Host country', example: 'England' },
                city: { type: 'string', description: 'Host city (optional)', example: 'London' }
              }
            },
            gender: { 
              type: 'integer', 
              description: 'Gender category: 1-Male, 2-Female',
              example: 1,
              enum: [1, 2]
            },
            primary_color: { 
              type: 'string', 
              description: 'Primary brand color (hex code)',
              example: '#FF0000'
            },
            secondary_color: { 
              type: 'string', 
              description: 'Secondary brand color (hex code)',
              example: '#0000FF'
            },
            uid: { 
              type: 'string', 
              description: 'Merged competition ID (if applicable)',
              example: 'merged_comp1'
            },
            updated_at: { 
              type: 'integer', 
              description: 'Last update timestamp',
              example: 1693555200
            }
          }
        },
        Team: {
          type: 'object',
          description: 'Football team information',
          required: ['id', 'country_id', 'name', 'updated_at'],
          properties: {
            id: { 
              type: 'string', 
              description: 'Unique team identifier',
              example: 'team123'
            },
            competition_id: { 
              type: 'string', 
              description: 'Primary league/competition ID (null for cups)',
              example: 'comp1'
            },
            country_id: { 
              type: 'string', 
              description: 'Country where team is based',
              example: 'c1'
            },
            name: { 
              type: 'string', 
              description: 'Full team name',
              example: 'Manchester United'
            },
            short_name: { 
              type: 'string', 
              description: 'Team abbreviation',
              example: 'MAN UTD'
            },
            logo: { 
              type: 'string', 
              description: 'URL to team logo/crest',
              example: 'https://example.com/logos/man-utd.png'
            },
            national: { 
              type: 'integer', 
              description: 'Whether national team: 1-Yes, 0-No',
              example: 0,
              enum: [0, 1]
            },
            country_logo: { 
              type: 'string', 
              description: 'National team flag URL (for national teams only)',
              example: 'https://example.com/flags/england.png'
            },
            foundation_time: { 
              type: 'integer', 
              description: 'Club foundation year timestamp',
              example: -2208988800
            },
            website: { 
              type: 'string', 
              description: 'Official team website URL',
              example: 'https://www.manutd.com'
            },
            coach_id: { 
              type: 'string', 
              description: 'Current head coach ID',
              example: 'coach456'
            },
            venue_id: { 
              type: 'string', 
              description: 'Home stadium/venue ID',
              example: 'venue789'
            },
            market_value: { 
              type: 'integer', 
              description: 'Team market value in specified currency',
              example: 850000000
            },
            market_value_currency: { 
              type: 'string', 
              description: 'Currency for market value (EUR, USD, etc.)',
              example: 'EUR'
            },
            total_players: { 
              type: 'integer', 
              description: 'Total squad size (-1 if no data)',
              example: 25
            },
            foreign_players: { 
              type: 'integer', 
              description: 'Number of foreign players (-1 if no data)',
              example: 15
            },
            national_players: { 
              type: 'integer', 
              description: 'Number of national team players (-1 if no data)',
              example: 8
            },
            uid: { 
              type: 'string', 
              description: 'Merged team ID (if applicable)',
              example: 'merged_team123'
            },
            virtual: { 
              type: 'integer', 
              description: 'Whether placeholder team: 1-Yes, 0-No',
              example: 0,
              enum: [0, 1]
            },
            gender: { 
              type: 'integer', 
              description: 'Team gender: 1-Male, 2-Female',
              example: 1,
              enum: [1, 2]
            },
            updated_at: { 
              type: 'integer', 
              description: 'Last update timestamp',
              example: 1693555200
            }
          }
        },
        Player: {
          type: 'object',
          description: 'Football player information with statistics',
          required: ['id', 'team_id', 'name', 'updated_at'],
          properties: {
            id: { 
              type: 'string', 
              description: 'Unique player identifier',
              example: 'player789'
            },
            team_id: { 
              type: 'string', 
              description: 'Current team ID (0 if retired/free agent/unknown)',
              example: 'team123'
            },
            name: { 
              type: 'string', 
              description: 'Player full name',
              example: 'Cristiano Ronaldo'
            },
            short_name: { 
              type: 'string', 
              description: 'Player abbreviated name',
              example: 'C. Ronaldo'
            },
            logo: { 
              type: 'string', 
              description: 'Player photo URL',
              example: 'https://example.com/players/ronaldo.jpg'
            },
            national_logo: { 
              type: 'string', 
              description: 'Player photo for national team lineup',
              example: 'https://example.com/players/ronaldo_national.jpg'
            },
            age: { 
              type: 'integer', 
              description: 'Player current age',
              example: 38
            },
            birthday: { 
              type: 'integer', 
              description: 'Birth date timestamp',
              example: 192134400
            },
            weight: { 
              type: 'integer', 
              description: 'Player weight in kg',
              example: 84
            },
            height: { 
              type: 'integer', 
              description: 'Player height in cm',
              example: 187
            },
            country_id: { 
              type: 'string', 
              description: 'Player nationality country ID',
              example: 'c2'
            },
            nationality: { 
              type: 'string', 
              description: 'Player nationality name',
              example: 'Portugal'
            },
            market_value: { 
              type: 'integer', 
              description: 'Player market value',
              example: 15000000
            },
            market_value_currency: { 
              type: 'string', 
              description: 'Market value currency',
              example: 'EUR'
            },
            contract_until: { 
              type: 'integer', 
              description: 'Contract expiration timestamp',
              example: 1719792000
            },
            preferred_foot: { 
              type: 'integer', 
              description: 'Preferred foot: 0-unknown, 1-left, 2-right, 3-both',
              example: 2,
              enum: [0, 1, 2, 3]
            },
            ability: { 
              type: 'array', 
              description: 'Player ability scores by category [type_id, rating, average]',
              items: {
                type: 'array',
                items: { type: 'integer' }
              },
              example: [[6, 99, 67], [9, 95, 82]]
            },
            characteristics: { 
              type: 'array', 
              description: 'Technical characteristics [[advantages], [disadvantages]]',
              items: {},
              example: [[[11, 1]], [[7, 1]]]
            },
            position: { 
              type: 'string', 
              description: 'Main position: F-forward, M-midfielder, D-defender, G-goalkeeper',
              example: 'F'
            },
            positions: { 
              type: 'array', 
              description: 'Detailed positions [main_position, [secondary_positions]]',
              items: {},
              example: ['RW', ['ST']]
            },
            uid: { 
              type: 'string', 
              description: 'Merged player ID (if applicable)',
              example: 'merged_player789'
            },
            deathday: { 
              type: 'integer', 
              description: 'Death timestamp (if applicable)',
              example: null
            },
            retire_time: { 
              type: 'integer', 
              description: 'Retirement timestamp (if applicable)',
              example: null
            },
            updated_at: { 
              type: 'integer', 
              description: 'Last update timestamp',
              example: 1693555200
            }
          }
        },
        Coach: {
          type: 'object',
          description: 'Football coach/manager information',
          required: ['id', 'name', 'updated_at'],
          properties: {
            id: { 
              type: 'string', 
              description: 'Unique coach identifier',
              example: 'coach456'
            },
            team_id: { 
              type: 'string', 
              description: 'Current team being coached',
              example: 'team123'
            },
            name: { 
              type: 'string', 
              description: 'Coach full name',
              example: 'Pep Guardiola'
            },
            short_name: { 
              type: 'string', 
              description: 'Coach abbreviated name',
              example: 'P. Guardiola'
            },
            logo: { 
              type: 'string', 
              description: 'Coach photo URL',
              example: 'https://example.com/coaches/guardiola.jpg'
            },
            type: { 
              type: 'integer', 
              description: 'Coach type: 1-Head coach, 2-Interim head coach',
              example: 1,
              enum: [1, 2]
            },
            birthday: { 
              type: 'integer', 
              description: 'Birth date timestamp',
              example: -63504000
            },
            age: { 
              type: 'integer', 
              description: 'Coach current age',
              example: 52
            },
            preferred_formation: { 
              type: 'string', 
              description: 'Preferred tactical formation',
              example: '4-3-3'
            },
            country_id: { 
              type: 'string', 
              description: 'Coach nationality country ID',
              example: 'c3'
            },
            nationality: { 
              type: 'string', 
              description: 'Coach nationality',
              example: 'Spain'
            },
            joined: { 
              type: 'integer', 
              description: 'Date joined current team timestamp',
              example: 1626825600
            },
            contract_until: { 
              type: 'integer', 
              description: 'Contract expiration timestamp',
              example: 1719792000
            },
            uid: { 
              type: 'string', 
              description: 'Merged coach ID (if applicable)',
              example: 'merged_coach456'
            },
            deathday: { 
              type: 'integer', 
              description: 'Death timestamp (if applicable)',
              example: null
            },
            updated_at: { 
              type: 'integer', 
              description: 'Last update timestamp',
              example: 1693555200
            }
          }
        },
        Referee: {
          type: 'object',
          description: 'Football referee information',
          required: ['id', 'name', 'updated_at'],
          properties: {
            id: { 
              type: 'string', 
              description: 'Unique referee identifier',
              example: 'ref123'
            },
            name: { 
              type: 'string', 
              description: 'Referee full name',
              example: 'Anthony Taylor'
            },
            short_name: { 
              type: 'string', 
              description: 'Referee abbreviated name',
              example: 'A. Taylor'
            },
            logo: { 
              type: 'string', 
              description: 'Referee photo URL',
              example: 'https://example.com/referees/taylor.jpg'
            },
            birthday: { 
              type: 'integer', 
              description: 'Birth date timestamp',
              example: 246931200
            },
            country_id: { 
              type: 'string', 
              description: 'Referee nationality country ID',
              example: 'c1'
            },
            uid: { 
              type: 'string', 
              description: 'Merged referee ID (if applicable)',
              example: 'merged_ref123'
            },
            updated_at: { 
              type: 'integer', 
              description: 'Last update timestamp',
              example: 1693555200
            }
          }
        },
        Venue: {
          type: 'object',
          description: 'Football stadium/venue information',
          required: ['id', 'name', 'updated_at'],
          properties: {
            id: { 
              type: 'string', 
              description: 'Unique venue identifier',
              example: 'venue789'
            },
            name: { 
              type: 'string', 
              description: 'Stadium/venue name',
              example: 'Old Trafford'
            },
            capacity: { 
              type: 'integer', 
              description: 'Stadium seating capacity',
              example: 74140
            },
            country_id: { 
              type: 'string', 
              description: 'Country where venue is located',
              example: 'c1'
            },
            city: { 
              type: 'string', 
              description: 'City where venue is located',
              example: 'Manchester'
            },
            country: { 
              type: 'string', 
              description: 'Country name where venue is located',
              example: 'England'
            },
            updated_at: { 
              type: 'integer', 
              description: 'Last update timestamp',
              example: 1693555200
            }
          }
        },
        Season: {
          type: 'object',
          description: 'Football competition season information',
          required: ['id', 'competition_id', 'year', 'updated_at'],
          properties: {
            id: { 
              type: 'string', 
              description: 'Unique season identifier',
              example: 'season2023'
            },
            competition_id: { 
              type: 'string', 
              description: 'Competition this season belongs to',
              example: 'comp1'
            },
            year: { 
              type: 'string', 
              description: 'Season year or year range',
              example: '2023/2024'
            },
            has_player_stats: { 
              type: 'integer', 
              description: 'Whether player statistics available: 1-Yes, 0-No',
              example: 1,
              enum: [0, 1]
            },
            has_team_stats: { 
              type: 'integer', 
              description: 'Whether team statistics available: 1-Yes, 0-No',
              example: 1,
              enum: [0, 1]
            },
            has_table: { 
              type: 'integer', 
              description: 'Whether league table available: 1-Yes, 0-No',
              example: 1,
              enum: [0, 1]
            },
            is_current: { 
              type: 'integer', 
              description: 'Whether this is the current active season: 1-Yes, 0-No',
              example: 1,
              enum: [0, 1]
            },
            start_time: { 
              type: 'integer', 
              description: 'Season start date timestamp',
              example: 1691712000
            },
            end_time: { 
              type: 'integer', 
              description: 'Season end date timestamp',
              example: 1719792000
            },
            updated_at: { 
              type: 'integer', 
              description: 'Last update timestamp',
              example: 1693555200
            }
          }
        },
        Stage: {
          type: 'object',
          description: 'Competition stage information (group stage, knockout, etc.)',
          required: ['id', 'season_id', 'name', 'updated_at'],
          properties: {
            id: { 
              type: 'string', 
              description: 'Unique stage identifier',
              example: 'stage1'
            },
            season_id: { 
              type: 'string', 
              description: 'Season this stage belongs to',
              example: 'season2023'
            },
            name: { 
              type: 'string', 
              description: 'Stage name',
              example: 'Group Stage'
            },
            mode: { 
              type: 'integer', 
              description: 'Match mode: 1-points (league), 2-elimination (knockout)',
              example: 1,
              enum: [1, 2]
            },
            group_count: { 
              type: 'integer', 
              description: 'Number of groups in this stage',
              example: 8
            },
            round_count: { 
              type: 'integer', 
              description: 'Number of rounds in this stage',
              example: 6
            },
            order: { 
              type: 'integer', 
              description: 'Stage order/sequence in the competition',
              example: 1
            },
            updated_at: { 
              type: 'integer', 
              description: 'Last update timestamp',
              example: 1693555200
            }
          }
        },
        VideoStream: {
          type: 'object',
          description: 'Video stream information for matches',
          required: ['sport_id', 'match_id', 'match_time', 'pushurl1'],
          properties: {
            sport_id: { 
              type: 'integer', 
              description: 'Sport type: 1-football, 2-basketball',
              example: 1,
              enum: [1, 2]
            },
            match_id: { 
              type: 'string', 
              description: 'Unique match identifier',
              example: 'n54qllhp2gd1qvy'
            },
            match_time: { 
              type: 'integer', 
              description: 'Match timestamp (Unix timestamp)',
              example: 1644886800
            },
            pushurl1: { 
              type: 'string', 
              description: 'SD stream address (RTMP URL)',
              example: 'rtmp://xxxx/xx/sd-1-3674457'
            },
            pushurl2: { 
              type: 'string', 
              description: 'English HD stream address (RTMP URL), can be empty',
              example: ''
            },
            created_at: { 
              type: 'string', 
              format: 'date-time',
              description: 'Record creation timestamp'
            },
            updated_at: { 
              type: 'string', 
              format: 'date-time',
              description: 'Record last update timestamp'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', description: 'Response code' },
            results: { type: 'array', items: { type: 'object' } }
          }
        },
        ApiSingleResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', description: 'Response code' },
            result: { type: 'object' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            code: { type: 'integer', description: 'Error code' },
            message: { type: 'string', description: 'Error message' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJSDoc(options);

module.exports = specs;
