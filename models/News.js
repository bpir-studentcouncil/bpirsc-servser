import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: [
      'Technical Education News',
      'Engineering Updates',
      'Scholarship Information',
      'Higher Study Opportunities',
      'Notice Board',
      'Alumni Opinions',
      'Student Articles',
      'Success Stories'
    ]
  },
  coverImage: { type: String }, // Cloudinary URL
  authorName: { type: String, required: true },
  authorRole: { type: String, default: 'Student' }, // e.g. Admin, Alumni, Student
  publishedAt: { type: Date, default: Date.now },
  isFeatured: { type: Boolean, default: false }
});

export default mongoose.model('News', newsSchema);
