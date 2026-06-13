import express from 'express';
import { dbClient } from '../utils/dbClient.js';
import { authenticateUser, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Get all news, with optional search and category filters
router.get('/', async (req, res) => {
  const { category, search, featured } = req.query;
  
  try {
    let newsList = await dbClient.news.find();
    
    // Fetch all users to build a name-to-photo mapping
    const users = await dbClient.users.find();
    const userPhotoMap = {};
    users.forEach(u => {
      if (u.name) {
        userPhotoMap[u.name.toLowerCase()] = u.profilePhoto;
      }
    });
    
    // Filter in code for compatibility between Mongoose and Mock JSON client
    if (featured === 'true') {
      newsList = newsList.filter(item => item.isFeatured === true);
    }
    
    if (category) {
      newsList = newsList.filter(item => item.category === category);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      newsList = newsList.filter(item => 
        item.title.toLowerCase().includes(searchLower) || 
        item.content.toLowerCase().includes(searchLower)
      );
    }

    // Attach authorPhoto dynamically
    const updatedNewsList = newsList.map(item => {
      const authorPhoto = item.authorPhoto || (item.authorName ? userPhotoMap[item.authorName.toLowerCase()] : '');
      return {
        ...item,
        authorPhoto: authorPhoto || ''
      };
    });

    res.json(updatedNewsList);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ message: 'Error fetching news' });
  }
});

// Get single news item
router.get('/:id', async (req, res) => {
  try {
    const newsItem = await dbClient.news.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ message: 'News article not found' });
    }
    
    // Find the author's profile photo
    let authorPhoto = newsItem.authorPhoto || '';
    if (!authorPhoto && newsItem.authorName) {
      const author = await dbClient.users.findOne({ name: newsItem.authorName });
      if (author) {
        authorPhoto = author.profilePhoto || '';
      }
    }

    res.json({
      ...newsItem,
      authorPhoto
    });
  } catch (error) {
    console.error('Error fetching news detail:', error);
    res.status(500).json({ message: 'Error fetching news details' });
  }
});

// Admin Only: Create news
router.post('/', authenticateUser, requireAdmin, async (req, res) => {
  const { title, content, category, coverImage, isFeatured } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({ message: 'Title, content and category are required' });
  }

  try {
    const newsItem = await dbClient.news.create({
      title,
      content,
      category,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
      authorName: req.user.name,
      authorRole: req.user.role === 'admin' ? 'Admin' : req.user.role === 'alumni' ? 'Alumni' : 'Student',
      authorPhoto: req.user.profilePhoto || '',
      isFeatured: isFeatured === true || isFeatured === 'true',
      publishedAt: new Date()
    });

    res.status(201).json(newsItem);
  } catch (error) {
    console.error('Error creating news:', error);
    res.status(500).json({ message: 'Error creating news article' });
  }
});

// Admin Only: Update news
router.put('/:id', authenticateUser, requireAdmin, async (req, res) => {
  const { title, content, category, coverImage, isFeatured } = req.body;

  try {
    const updatedNews = await dbClient.news.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        category,
        coverImage,
        isFeatured: isFeatured === true || isFeatured === 'true'
      },
      { new: true }
    );

    if (!updatedNews) {
      return res.status(404).json({ message: 'News article not found' });
    }

    res.json(updatedNews);
  } catch (error) {
    console.error('Error updating news:', error);
    res.status(500).json({ message: 'Error updating news article' });
  }
});

// Admin Only: Delete news
router.delete('/:id', authenticateUser, requireAdmin, async (req, res) => {
  try {
    const deletedNews = await dbClient.news.findByIdAndDelete(req.params.id);
    if (!deletedNews) {
      return res.status(404).json({ message: 'News article not found' });
    }
    res.json({ message: 'News article deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    res.status(500).json({ message: 'Error deleting news article' });
  }
});

export default router;
