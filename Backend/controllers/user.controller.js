import User from '../models/user.model.js';
import cloudinary from '../config/cloudinary-config.js'

export const createUser = async (req, res) => {
  try {sts
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    // Upload image to Cloudinary
    const imageResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'user_uploads' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Create new user
    const newUser = new User({
      country: req.body.country,
      city: req.body.city,
      course: req.body.course,
      proficiency: req.body.proficiency,
      fullName: req.body.fullName,
      fatherName: req.body.fatherName,
      email: req.body.email,
      cnic: req.body.cnic,
      phone: req.body.phone,
      fatherCnic: req.body.fatherCnic || null,
      dob: req.body.dob,
      gender: req.body.gender,
      qualification: req.body.qualification,
      hasLaptop: req.body.hasLaptop,
      imageUrl: imageResult.secure_url,
      imagePublicId: imageResult.public_id
    });

    // Save to database
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser._id,
        ...newUser.toObject()
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle duplicate key error (for CNIC)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User with this CNIC already exists'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getUserByCnic = async (req, res) => {
  try {
    const user = await User.findOne({ cnic: req.params.cnic });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    return res.json({ 
      success: true, 
      user: {
        id: user._id,
        ...user.toObject()
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};