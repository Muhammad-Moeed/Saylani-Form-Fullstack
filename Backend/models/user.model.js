import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  country: { type: String, required: true },
  city: { type: String, required: true },
  course: { type: String, required: true },
  proficiency: { type: String, required: true },
  fullName: { type: String, required: true },
  fatherName: { type: String, required: true },
  email: { type: String, required: true },
  cnic: { type: String, required: true},
  phone: { type: String, required: true },
  fatherCnic: { type: String },
  dob: { type: String, required: true },
  gender: { type: String, required: true },
  qualification: { type: String, required: true },
  hasLaptop: { type: String, required: true },
  imageUrl: { type: String, required: true },
  imagePublicId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;