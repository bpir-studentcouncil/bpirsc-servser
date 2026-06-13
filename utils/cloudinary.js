import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && 
                     process.env.CLOUDINARY_API_KEY && 
                     process.env.CLOUDINARY_API_SECRET;

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('☁️  Cloudinary initialized for image uploads.');
} else {
  console.log('⚠️  Cloudinary credentials not provided. Images will be processed as Base64 URIs.');
}

export const uploadToCloudinary = async (fileBuffer, mimeType, folder = 'bpirsc') => {
  if (!hasCloudinary) {
    // Return base64 string in mock mode so it acts as a valid image URL for direct loading
    const base64Image = fileBuffer.toString('base64');
    return `data:${mimeType || 'image/jpeg'};base64,${base64Image}`;
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload stream error:', error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};
