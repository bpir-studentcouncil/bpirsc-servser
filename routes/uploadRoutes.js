import express from 'express';
import multer from 'multer';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { authenticateUser } from '../middlewares/auth.js';

const router = express.Router();

// Multer memory configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Single image upload route
router.post('/', authenticateUser, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      'bpirsc/uploads'
    );

    res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error('Single image upload error:', error);
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
});

// Multiple image upload route
router.post('/multiple', authenticateUser, upload.array('images', 8), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadPromises = files.map(file => 
      uploadToCloudinary(file.buffer, file.mimetype, 'bpirsc/gallery')
    );

    const imageUrls = await Promise.all(uploadPromises);
    res.status(200).json({ urls: imageUrls });
  } catch (error) {
    console.error('Multiple image upload error:', error);
    res.status(500).json({ message: 'Gallery upload failed', error: error.message });
  }
});

export default router;
