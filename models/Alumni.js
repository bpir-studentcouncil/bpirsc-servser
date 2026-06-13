import mongoose from 'mongoose';

const alumniSchema = new mongoose.Schema({
  uid: { type: String, required: true }, // Links to the User UID
  fullName: { type: String, required: true },
  department: { 
    type: String, 
    required: true,
    enum: ['Computer', 'Civil', 'Electrical', 'Mechanical', 'Electronics', 'Power', 'Electro-Medical']
  },
  session: { type: String, required: true },
  studentId: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  currentOccupation: { type: String, required: true },
  company: { type: String },
  higherEducation: { type: String },
  address: { type: String, required: true },
  profilePhoto: { type: String }, // Cloudinary URL
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'verified'], default: 'pending' },
  paymentTrxId: { type: String }, // bKash/Nagad trx id for registration fee
  submittedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Alumni', alumniSchema);
