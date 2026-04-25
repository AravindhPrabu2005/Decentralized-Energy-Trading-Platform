const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,        // ✅ matches .env
  api_key: process.env.CLOUD_API_KEY,        // ✅ matches .env
  api_secret: process.env.CLOUD_API_SECRET   // ✅ matches .env
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'greenwave/profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

module.exports = { cloudinary, upload };