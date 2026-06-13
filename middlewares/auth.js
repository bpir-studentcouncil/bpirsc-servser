import admin from 'firebase-admin';
import { dbClient } from '../utils/dbClient.js';

// Initialize firebase-admin if FB_SERVICE_KEY is configured
let isFirebaseAdminInitialized = false;
if (process.env.FB_SERVICE_KEY) {
  try {
    const decodedKey = Buffer.from(process.env.FB_SERVICE_KEY, 'base64').toString('utf-8');
    const serviceAccount = JSON.parse(decodedKey);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    isFirebaseAdminInitialized = true;
    console.log('🔥 Firebase Admin SDK initialized successfully.');
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', err.message);
  }
} else {
  console.warn('⚠️ FB_SERVICE_KEY not configured. Firebase Admin verification will be skipped for mock bypass.');
}

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or invalid format' });
    }

    const token = authHeader.split(' ')[1];
    
    let uid = token;
    let email = req.headers['x-user-email'] || '';
    let name = req.headers['x-user-name'] || '';

    // Verify token using Firebase Admin if initialized and it is not a mock token
    if (isFirebaseAdminInitialized && !token.startsWith('mock-uid-')) {
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        uid = decoded.uid;
        email = decoded.email || '';
        name = decoded.name || email.split('@')[0] || '';
      } catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid Firebase ID token', error: err.message });
      }
    }

    // Look up the corresponding user record in our database.
    const user = await dbClient.users.findOne({ uid });
    
    if (!user) {
      // Create user on the fly if email is available (either from Firebase ID token or headers fallback)
      if (email) {
        const newUser = await dbClient.users.create({
          uid,
          email,
          name: name || email.split('@')[0],
          role: 'student', // Default role
          createdAt: new Date()
        });
        req.user = newUser;
        return next();
      }
      
      return res.status(401).json({ message: 'User profile not found. Please register.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ message: 'Server authentication error' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
  next();
};

export const requireAlumniOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'alumni' && req.user.role !== 'admin')) {
    return res.status(403).json({ message: 'Access denied. Alumni or Admin privileges required.' });
  }
  next();
};
