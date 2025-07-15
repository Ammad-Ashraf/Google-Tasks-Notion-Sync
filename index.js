const express = require('express');
const dotenv = require('dotenv');
const cron = require('node-cron');
const { syncGoogleTasksToNotion } = require('./src/sync');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------
// ROUTE: Manual Sync Trigger
// Access: GET http://localhost:3000/sync
// Purpose: Manually trigger a sync when you hit this route
// ---------------------------------------------------
app.get('/sync', async (req, res) => {
  try {
    await syncGoogleTasksToNotion(); // Run sync logic
    res.status(200).send('-- Sync triggered successfully.');
  } catch (error) {
    console.error('-- Sync failed:', error.message);
    res.status(500).send('-- Sync failed. Check server logs.');
  }
});

// ---------------------------------------------------
// CRON JOB: Auto-Sync every 5 minutes
// Schedule: */5 * * * * = every 5 minutes
// ---------------------------------------------------
cron.schedule('*/5 * * * *', async () => {
  console.log('-- Running scheduled sync...');
  try {
    await syncGoogleTasksToNotion();
    console.log('-- Scheduled sync complete.');
  } catch (error) {
    console.error('-- Scheduled sync failed:', error.message);
  }
});

// ---------------------------------------------------
// Start the server
// ---------------------------------------------------
app.listen(PORT, () => {
  console.log(`-- Server is running on http://localhost:${PORT}`);
});


