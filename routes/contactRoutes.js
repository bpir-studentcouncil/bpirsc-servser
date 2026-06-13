import express from 'express';
import { dbClient } from '../utils/dbClient.js';
import { authenticateUser, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Public: Submit a message
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All form fields are required' });
  }

  try {
    const contactMessage = await dbClient.contacts.create({
      name,
      email,
      subject,
      message,
      isRead: false,
      createdAt: new Date()
    });

    res.status(201).json(contactMessage);
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ message: 'Server error saving message. Please try again.' });
  }
});

// Admin Only: Get all contact messages
router.get('/', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const messages = await dbClient.contacts.find();
    res.json(messages);
  } catch (error) {
    console.error('Error listing contact messages:', error);
    res.status(500).json({ message: 'Server error listing messages' });
  }
});

// Admin Only: Mark message as read/unread
router.put('/:id/read', authenticateUser, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { isRead } = req.body;

  try {
    const updatedMessage = await dbClient.contacts.findByIdAndUpdate(
      id,
      { isRead: isRead === true || isRead === 'true' },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(updatedMessage);
  } catch (error) {
    console.error('Error updating read status:', error);
    res.status(500).json({ message: 'Server error updating read status' });
  }
});

// Admin Only: Delete a contact message
router.delete('/:id', authenticateUser, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedMessage = await dbClient.contacts.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({ message: 'Server error deleting message' });
  }
});

export default router;
