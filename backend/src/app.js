require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const app = express();

// Middleware
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
const categoryRoutes = require('./routes/categoryRoutes');
const countryRoutes = require('./routes/countryRoutes');
const competitionRoutes = require('./routes/competitionRoutes');
const teamRoutes = require('./routes/teamRoutes');
const playerRoutes = require('./routes/playerRoutes');
const coachRoutes = require('./routes/coachRoutes');
const refereeRoutes = require('./routes/refereeRoutes');
const venueRoutes = require('./routes/venueRoutes');
const seasonRoutes = require('./routes/seasonRoutes');
const stageRoutes = require('./routes/stageRoutes');
const videoStreamRoutes = require('./routes/videoStreamRoutes');

app.use('/api/categories', categoryRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/referees', refereeRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/stages', stageRoutes);
app.use('/api/video-streams', videoStreamRoutes);

// TODO: Import and use routes here
// const userRoutes = require('./routes/userRoutes');
// app.use('/api/users', userRoutes);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};


// Start cron jobs after DB connected
const { initializeCategoryCron } = require('./cron/categoryCron');
const { initializeCountryCron } = require('./cron/countryCron');
const { initializeCompetitionCron } = require('./cron/competitionCron');
const { initializeTeamCron } = require('./cron/teamCron');
const { initializePlayerCron } = require('./cron/playerCron');
const { initializeCoachCron } = require('./cron/coachCron');
const { initializeRefereeCron } = require('./cron/refereeCron');
const { initializeVenueCron } = require('./cron/venueCron');
const { initializeSeasonCron } = require('./cron/seasonCron');
const { initializeStageCron } = require('./cron/stageCron');
const { initializeVideoStreamCron } = require('./cron/videoStreamCron');

connectDB().then(async () => {
  // Initialize all cron jobs (check data and start)
  console.log('� Initializing cron jobs...');
  
  await initializeCategoryCron();
  await initializeCountryCron();
  await initializeCompetitionCron();
  await initializeTeamCron();
  await initializePlayerCron();
  await initializeCoachCron();
  await initializeRefereeCron();
  await initializeVenueCron();
  await initializeSeasonCron();
  await initializeStageCron();
  await initializeVideoStreamCron();
  
  console.log('✅ All cron jobs initialized successfully');
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

module.exports = app;
