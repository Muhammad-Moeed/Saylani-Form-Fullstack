import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({
  limits: {
    fileSize: 3 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  },
  storage: storage,
});

export default upload;