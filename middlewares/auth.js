import { dbClient } from '../utils/dbClient.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization header missing or invalid format' });
    }

    const token = authHeader.split(' ')[1];
    
    // In our client-server contract, the token represents the user's unique Firebase UID or mock UID.
    // We look up the corresponding user record in our database.
    const user = await dbClient.users.findOne({ uid: token });
    
    if (!user) {
      // Create user on the fly if token has standard email/name params (useful for automatic provisioning)
      const mockEmail = req.headers['x-user-email'];
      const mockName = req.headers['x-user-name'];
      
      if (mockEmail && mockName) {
        const newUser = await dbClient.users.create({
          uid: token,
          email: mockEmail,
          name: mockName,
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
