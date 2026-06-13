import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  coverImage: { type: String }, // Cloudinary URL
  gallery: { type: [String], default: [] }, // Array of Cloudinary URLs
  startDate: { type: Date },
  endDate: { type: Date },
  status: { 
    type: String, 
    enum: ['Ongoing', 'Completed', 'Upcoming'], 
    default: 'Ongoing' 
  },
  projectType: {
    type: String,
    required: true,
    enum: [
      'AutoCAD Course',
      'Technical Workshops',
      'Volunteer Programs',
      'Career Seminars',
      'Social Awareness Programs',
      'Blood Donation Campaigns',
      'Student Development Activities'
    ]
  },
  teamMembers: [{
    name: { type: String, required: true },
    role: { type: String, required: true }
  }],
  challenges: { type: String },
  outcomes: { type: String },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Project', projectSchema);
