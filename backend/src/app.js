import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import memberRoutes from './routes/memberRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'team-availability-tracker',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount Routes
app.use('/api', memberRoutes);

// Static frontend serving (root public or frontend/public)
const rootPublic = path.resolve(__dirname, '../../public');
const fallbackPublic = path.resolve(__dirname, '../../frontend/public');
const publicDir = fs.existsSync(rootPublic) ? rootPublic : fallbackPublic;
app.use(express.static(publicDir));

// Fallback to index.html for client-side navigation
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  const indexPath = path.join(publicDir, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

// 404 handler for API
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found`,
  });
});

export default app;
