const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ------------------------------------------------------------------
// 1. ENSURE UPLOADS DIRECTORY EXISTS
// ------------------------------------------------------------------
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ------------------------------------------------------------------
// 2. STORAGE CONFIGURATION
// ------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: fieldname-timestamp-random.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// ------------------------------------------------------------------
// 3. FILE FILTER – ALLOW ONLY IMAGES
// ------------------------------------------------------------------
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/ico'];
  const allowedExts = ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg', '.ico'];

  const ext = path.extname(file.originalname).toLowerCase();
  const isValidExt = allowedExts.includes(ext);
  const isValidMime = allowedMimes.includes(file.mimetype);

  if (isValidMime && isValidExt) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// ------------------------------------------------------------------
// 4. MULTER INSTANCE WITH LIMITS
// ------------------------------------------------------------------
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10                  // max 10 files per request
  },
  fileFilter: fileFilter
});

// ------------------------------------------------------------------
// 5. CENTRALISED ERROR HANDLER FOR MULTER
// ------------------------------------------------------------------
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    switch (err.code) {
      case 'FILE_TOO_LARGE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.'
        });
      case 'TOO_MANY_FILES':
        return res.status(400).json({
          success: false,
          message: 'Too many files uploaded.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name.'
        });
      default:
        return res.status(400).json({
          success: false,
          message: err.message
        });
    }
  } else if (err) {
    // Other errors (like fileFilter rejection)
    return res.status(400).json({
      success: false,
      message: err.message || 'Upload failed.'
    });
  }
  next();
};

// ------------------------------------------------------------------
// 6. EXPORT READY-TO-USE MIDDLEWARE FUNCTIONS
// ------------------------------------------------------------------
module.exports = {
  /**
   * Upload a single file (field name can be customised)
   * @param {string} fieldName - default 'image'
   */
  uploadSingle: (fieldName = 'image') => {
    return (req, res, next) => {
      const single = upload.single(fieldName);
      single(req, res, (err) => {
        if (err) return handleMulterError(err, req, res, next);
        next();
      });
    };
  },

  /**
   * Upload multiple files (all under the same field name)
   * @param {string} fieldName - default 'images'
   * @param {number} maxCount - default 5
   */
  uploadMultiple: (fieldName = 'images', maxCount = 5) => {
    return (req, res, next) => {
      const multiple = upload.array(fieldName, maxCount);
      multiple(req, res, (err) => {
        if (err) return handleMulterError(err, req, res, next);
        next();
      });
    };
  },

  /**
   * Upload mixed fields (e.g. thumbnail + gallery)
   * @param {Array} fields - array of { name: string, maxCount: number }
   */
  uploadFields: (fields) => {
    return (req, res, next) => {
      const mixed = upload.fields(fields);
      mixed(req, res, (err) => {
        if (err) return handleMulterError(err, req, res, next);
        next();
      });
    };
  },

  /**
   * Direct access to multer instance (advanced use)
   */
  multer: upload
};