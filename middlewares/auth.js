import { dbClient } from '../utils/dbClient.js';

// Firebase Admin SDK disabled per user request
export const isFirebaseAdminInitialized = false;
export const firebaseAdminError = 'Firebase Admin SDK disabled by user request';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or invalid format' });
    }

    const token = authHeader.split(' ')[1];
    
    // Without Firebase Admin SDK, the client passes the raw user uid directly in the Authorization header
    const uid = token;
    let email = req.headers['x-user-email'] || '';
    let name = req.headers['x-user-name'] || '';

    // Look up the corresponding user record in our database.
    const user = await dbClient.users.findOne({ uid });
    
    if (!user) {
      // Create user on the fly if email is available (either from headers fallback)
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
