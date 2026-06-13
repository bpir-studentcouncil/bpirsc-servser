// Environment configuration loaded first
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB, isDemoMode, getConnectionStatus } from './utils/dbClient.js';
import { isFirebaseAdminInitialized, firebaseAdminError } from './middlewares/auth.js';

// Route imports
import userRoutes from './routes/userRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import alumniRoutes from './routes/alumniRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import teamRoutes from './routes/teamRoutes.js';


const app = express();
const PORT = process.env.PORT || 5000;

// Apply Middlewares
const allowedOrigins = [
  'https://bpirsc-web.netlify.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl/Postman requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin matches any in allowedOrigins list or DOMAIN_URL env var
    const domainUrl = process.env.DOMAIN_URL;
    if (allowedOrigins.indexOf(origin) !== -1 || (domainUrl && origin === domainUrl)) {
      return callback(null, true);
    }
    
    // Proactively allow any localhost/127.0.0.1 sub-port for local dev ease
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    
    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-email', 'x-user-name']
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Database Connection Middleware (ensures MongoDB is connected before handling requests)
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// API Routes mounting
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/team', teamRoutes);


// Root route displaying status
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'BPIRSC API Server is running smoothly',
    mode: isDemoMode ? 'Demo Mode (Local JSON Storage)' : 'Production Mode (MongoDB Connected)',
    firebaseAdminInitialized: isFirebaseAdminInitialized,
    firebaseAdminError: firebaseAdminError,
    dbStatus: getConnectionStatus()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 BPIRSC Server listening on port ${PORT}`);
    console.log(`🌐 API status: http://localhost:${PORT}/`);
  });
}).catch((err) => {
  console.error('Database connection failed on startup:', err);
  app.listen(PORT, () => {
    console.log(`🚀 BPIRSC Server listening on port ${PORT} (fallback mode)`);
  });
});

export default app;

