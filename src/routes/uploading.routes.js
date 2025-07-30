const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const cloudinary = require('../config/cloudinaryConfig');
const authenticateToken = require('../middleware/auth');

// middlewares
const uploadCarImage = require('../middleware/uploadCar');
const uploadUserImage = require('../middleware/uploadUser');
const uploadCompanyImage = require('../middleware/uploadCompany');
const uploadAdminImage = require('../middleware/uploadAdmin');
const db = require('../config/db');

// Helper to upload to Cloudinary then delete local file
const uploadToCloudinary = async (filePath, folder) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  });
  fs.unlinkSync(filePath); // remove local file
  return result.secure_url;
};

// 🚗 Upload car image
router.post('/car/:carId', authenticateToken, uploadCarImage.single('image'), async (req, res) => {
  const carId = req.params.carId;
  const filePath = req.file.path;

  try {
    const imageUrl = await uploadToCloudinary(filePath, 'car-images');
    await db.query('UPDATE cars SET image_url = ? WHERE id = ?', [imageUrl, carId]);
    res.json({ message: 'Car image uploaded', imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 👤 Upload user profile image
router.post('/user', authenticateToken, uploadUserImage.single('image'), async (req, res) => {
  const userId = req.user.id;
  const filePath = req.file.path;

  try {
    const imageUrl = await uploadToCloudinary(filePath, 'user-profiles');
    await db.query('UPDATE users SET profile_pic = ? WHERE id = ?', [imageUrl, userId]);
    res.json({ message: 'User profile image uploaded', imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🏢 Upload company profile image
router.post('/company', authenticateToken, uploadCompanyImage.single('image'), async (req, res) => {
  const companyId = req.user.id;
  const filePath = req.file.path;

  try {
    const imageUrl = await uploadToCloudinary(filePath, 'company-profiles');
    await db.query('UPDATE companies SET profile_image = ? WHERE id = ?', [imageUrl, companyId]);
    res.json({ message: 'Company profile image uploaded', imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🛡️ Upload admin profile image
router.post('/admin', authenticateToken, uploadAdminImage.single('image'), async (req, res) => {
  const adminId = req.user.id;
  const filePath = req.file.path;

  try {
    const imageUrl = await uploadToCloudinary(filePath, 'admin-profiles');
    await db.query('UPDATE admins SET profile_image = ? WHERE id = ?', [imageUrl, adminId]);
    res.json({ message: 'Admin profile image uploaded', imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
