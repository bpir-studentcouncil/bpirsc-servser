import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  dept: { type: String, required: true },
  photo: { type: String, default: '' },
  bio: { type: String, required: true },
  social: {
    facebook: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('TeamMember', teamMemberSchema);
