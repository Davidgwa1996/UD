const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ------------------------------------------------------------------
// 1. ENSURE UPLOAD DIRECTORY EXISTS
// ------------------------------------------------------------------
const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ------------------------------------------------------------------
// 2. STORAGE CONFIG
// ------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * 1e9);

    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// ------------------------------------------------------------------
// 3. FILE FILTER (IMAGES ONLY)
// ------------------------------------------------------------------
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/x-icon',
    'image/vnd.microsoft.icon'
  ];

  const allowedExts = [
    '.jpeg',
    '.jpg',
    '.png',
    '.gif',
    '.webp',
    '.svg',
    '.ico'
  ];

  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// ------------------------------------------------------------------
// 4. MULTER INSTANCE
// ------------------------------------------------------------------
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10
  }
});

// ------------------------------------------------------------------
// 5. ERROR HANDLER
// ------------------------------------------------------------------
const handleMulterError = (err, req, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Max size is 5MB'
      });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name'
      });
    }

    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  return res.status(400).json({
    success: false,
    message: err.message || 'Upload failed'
  });
};

// ------------------------------------------------------------------
// 6. SAFE WRAPPERS
// ------------------------------------------------------------------
const uploadSingle = (field = 'image') => {
  return (req, res, next) => {
    upload.single(field)(req, res, (err) => {
      handleMulterError(err, req, res, next);
    });
  };
};

const uploadMultiple = (field = 'images', max = 5) => {
  return (req, res, next) => {
    upload.array(field, max)(req, res, (err) => {
      handleMulterError(err, req, res, next);
    });
  };
};

const uploadFields = (fields) => {
  return (req, res, next) => {
    upload.fields(fields)(req, res, (err) => {
      handleMulterError(err, req, res, next);
    });
  };
};

// ------------------------------------------------------------------
// 7. EXPORT (IMPORTANT)
// ------------------------------------------------------------------
module.exports = upload;                 // allows upload.single(...)
module.exports.uploadSingle = uploadSingle;
module.exports.uploadMultiple = uploadMultiple;
module.exports.uploadFields = uploadFields;
module.exports.handleMulterError = handleMulterError;
