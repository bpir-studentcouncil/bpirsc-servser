import express from 'express';
import { dbClient } from '../utils/dbClient.js';
import { authenticateUser, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Get all team members (Public)
router.get('/', async (req, res) => {
  try {
    const list = await dbClient.teamMembers.find();
    res.json(list);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Error fetching team members' });
  }
});

// Admin only: Add a new team member
router.post('/', authenticateUser, requireAdmin, async (req, res) => {
  const { name, position, dept, photo, bio, facebook, linkedin, twitter, instagram, sortOrder } = req.body;

  if (!name || !position || !dept || !bio) {
    return res.status(400).json({ message: 'Name, position, department, and bio are required fields.' });
  }

  try {
    const newMember = await dbClient.teamMembers.create({
      name,
      position,
      dept,
      photo: photo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
      bio,
      sortOrder: Number(sortOrder) || 1,
      social: {
        facebook: facebook || '',
        linkedin: linkedin || '',
        twitter: twitter || '',
        instagram: instagram || ''
      }
    });
    res.status(201).json(newMember);
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ message: 'Error adding team member' });
  }
});

// Admin only: Update a team member's details
router.put('/:id', authenticateUser, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, position, dept, photo, bio, facebook, linkedin, twitter, instagram, sortOrder } = req.body;

  if (!name || !position || !dept || !bio) {
    return res.status(400).json({ message: 'Name, position, department, and bio are required fields.' });
  }

  try {
    const updates = {
      name,
      position,
      dept,
      photo: photo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
      bio,
      sortOrder: Number(sortOrder) || 1,
      social: {
        facebook: facebook || '',
        linkedin: linkedin || '',
        twitter: twitter || '',
        instagram: instagram || ''
      }
    };
    
    const updatedMember = await dbClient.teamMembers.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json(updatedMember);
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ message: 'Error updating team member' });
  }
});

// Admin only: Delete a team member
router.delete('/:id', authenticateUser, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await dbClient.teamMembers.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ message: 'Error deleting team member' });
  }
});

export default router;
