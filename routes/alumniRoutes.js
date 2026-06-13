import express from 'express';
import { dbClient } from '../utils/dbClient.js';
import { authenticateUser, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Register as an Alumni
router.post('/register', authenticateUser, async (req, res) => {
  const {
    fullName, department, session, studentId, phone, email,
    currentOccupation, company, higherEducation, address, profilePhoto,
    paymentTrxId
  } = req.body;

  if (!fullName || !department || !session || !studentId || !phone || !email || !address) {
    return res.status(400).json({ message: 'All mandatory profile fields are required' });
  }

  try {
    // Check if alumni profile already exists for this user
    let existingProfile = await dbClient.alumni.findOne({ uid: req.user.uid });
    if (existingProfile) {
      return res.status(400).json({ message: 'Alumni registration request already exists for this account' });
    }

    const alumniRequest = await dbClient.alumni.create({
      uid: req.user.uid,
      fullName,
      department,
      session,
      studentId,
      phone,
      email,
      currentOccupation,
      company: company || '',
      higherEducation: higherEducation || '',
      address,
      profilePhoto: profilePhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80',
      paymentTrxId: paymentTrxId || '',
      status: 'pending',
      paymentStatus: 'pending',
      submittedAt: new Date()
    });

    res.status(201).json(alumniRequest);
  } catch (error) {
    console.error('Alumni registration error:', error);
    res.status(500).json({ message: 'Error processing registration' });
  }
});

// Get current user's alumni request status
router.get('/my-status', authenticateUser, async (req, res) => {
  try {
    const profile = await dbClient.alumni.findOne({ uid: req.user.uid });
    if (!profile) {
      return res.status(404).json({ message: 'No alumni registration profile found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Error fetching alumni registration status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get approved Alumni directory (Public)
router.get('/directory', async (req, res) => {
  const { department, session, search } = req.query;

  try {
    let list = await dbClient.alumni.find({ status: 'approved' });

    if (department) {
      list = list.filter(item => item.department === department);
    }
    
    if (session) {
      list = list.filter(item => item.session.includes(session));
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      list = list.filter(item => 
        item.fullName.toLowerCase().includes(searchLower) ||
        (item.company && item.company.toLowerCase().includes(searchLower)) ||
        (item.currentOccupation && item.currentOccupation.toLowerCase().includes(searchLower))
      );
    }

    res.json(list);
  } catch (error) {
    console.error('Error fetching alumni directory:', error);
    res.status(500).json({ message: 'Server error fetching directory' });
  }
});

// Admin Only: Get all pending alumni requests
router.get('/pending', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const list = await dbClient.alumni.find({ status: 'pending' });
    res.json(list);
  } catch (error) {
    console.error('Error fetching pending alumni requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Only: Approve/Reject Alumni Request
router.put('/:id/status', authenticateUser, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const request = await dbClient.alumni.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Alumni request not found' });
    }

    const updatedRequest = await dbClient.alumni.findByIdAndUpdate(id, { status }, { new: true });

    // If approved, sync user role in users collection to 'alumni' (unless they are already an admin)
    if (status === 'approved') {
      const user = await dbClient.users.findOne({ uid: request.uid });
      if (user && user.role !== 'admin') {
        await dbClient.users.findByIdAndUpdate(user._id, { role: 'alumni' });
      }
    } else {
      // If rejected/reset, change user role back to student (unless they are already an admin)
      const user = await dbClient.users.findOne({ uid: request.uid });
      if (user && user.role === 'alumni') {
        await dbClient.users.findByIdAndUpdate(user._id, { role: 'student' });
      }
    }

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error modifying alumni status:', error);
    res.status(500).json({ message: 'Server error updating status' });
  }
});

// Admin Only: Verify payment status
router.put('/:id/payment', authenticateUser, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body; // 'pending' or 'verified'

  try {
    const request = await dbClient.alumni.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Alumni request not found' });
    }

    const updatedRequest = await dbClient.alumni.findByIdAndUpdate(id, { paymentStatus }, { new: true });
    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating payment verification:', error);
    res.status(500).json({ message: 'Server error updating payment status' });
  }
});

export default router;
