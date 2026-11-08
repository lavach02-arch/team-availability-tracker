import app from './app.js';

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`========================================================`);
  console.log(`  Team Availability Tracker Server Running!`);
  console.log(`  URL:         http://localhost:${PORT}`);
  console.log(`  Health:      http://localhost:${PORT}/api/health`);
  console.log(`  Stats:       http://localhost:${PORT}/api/stats`);
  console.log(`  Live Stream: http://localhost:${PORT}/api/stream`);
  console.log(`========================================================`);
});
