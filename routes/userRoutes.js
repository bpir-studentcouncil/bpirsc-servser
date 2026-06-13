import express from 'express';
import { dbClient } from '../utils/dbClient.js';
import { authenticateUser, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Synchronize Firebase Auth user with our database
// Synchronize Firebase Auth user with our database
router.post('/sync', async (req, res) => {
  const { uid, email, name, role, profilePhoto } = req.body;
  
  if (!uid || !email || !name) {
    return res.status(400).json({ message: 'Missing required user parameters' });
  }

  try {
    let user = await dbClient.users.findOne({ uid });
    
    if (!user) {
      const userRole = (email === 'admin@bpirsc.org') ? 'admin' : (role || 'student');
      user = await dbClient.users.create({
        uid,
        email,
        name,
        role: userRole,
        profilePhoto: profilePhoto || '',
        createdAt: new Date()
      });
      return res.status(201).json(user);
    }

    // Update profile photo in MongoDB if it is empty or updated in Firebase
    if (profilePhoto && user.profilePhoto !== profilePhoto) {
      user = await dbClient.users.findByIdAndUpdate(user._id, { profilePhoto }, { new: true });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ message: 'Error synchronizing user profile' });
  }
});

// Get current logged-in user profile
router.get('/profile', authenticateUser, (req, res) => {
  res.json(req.user);
});

// Update current logged-in user profile name & photo
router.put('/profile', authenticateUser, async (req, res) => {
  const { name, profilePhoto } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Name is required' });
  }
  try {
    const updates = { name: name.trim() };
    if (profilePhoto !== undefined) {
      updates.profilePhoto = profilePhoto;
    }
    const updatedUser = await dbClient.users.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
});

// Allow users to switch their own role between student and alumni
router.put('/profile/role', authenticateUser, async (req, res) => {
  const { role } = req.body;
  if (!['student', 'alumni'].includes(role)) {
    return res.status(400).json({ message: 'You can only switch between Student and Alumni roles.' });
  }
  try {
    const updatedUser = await dbClient.users.findByIdAndUpdate(req.user._id, { role }, { new: true });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error switching role:', error);
    res.status(500).json({ message: 'Error switching role' });
  }
});


// Admin only: Get all registered users
router.get('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const users = await dbClient.users.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users list' });
  }
});

// Admin only: Modify user role
router.put('/:uid/role', authenticateUser, requireAdmin, async (req, res) => {
  const { uid } = req.params;
  const { role } = req.body;

  if (!['admin', 'student', 'alumni'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const user = await dbClient.users.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await dbClient.users.findByIdAndUpdate(user._id, { role }, { new: true });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Error updating user role' });
  }
});

export default router;
