const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ------------------------------------------------------------------
// 1. CONFIGURATION
// ------------------------------------------------------------------
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for videos
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024; // 20MB for documents

// Allowed file types by category
const ALLOWED_TYPES = {
  images: {
    mimes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/x-icon',
      'image/vnd.microsoft.icon',
      'image/bmp',
      'image/tiff'
    ],
    exts: ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg', '.ico', '.bmp', '.tiff']
  },
  documents: {
    mimes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ],
    exts: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv']
  },
  videos: {
    mimes: [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska',
      'video/webm'
    ],
    exts: ['.mp4', '.mpeg', '.mov', '.avi', '.mkv', '.webm']
  }
};

// ------------------------------------------------------------------
// 2. ENSURE UPLOAD DIRECTORIES EXIST
// ------------------------------------------------------------------
const baseUploadDir = path.join(__dirname, '../../uploads');
const subDirs = ['avatars', 'products', 'documents', 'videos', 'temp'];

// Create all necessary directories
const ensureDirectories = () => {
  if (!fs.existsSync(baseUploadDir)) {
    fs.mkdirSync(baseUploadDir, { recursive: true });
  }
  
  subDirs.forEach(dir => {
    const dirPath = path.join(baseUploadDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

ensureDirectories();

// ------------------------------------------------------------------
// 3. DYNAMIC STORAGE CONFIG (determine destination based on file type)
// ------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let destinationDir = baseUploadDir;
    
    // Determine subdirectory based on file type or field name
    if (file.fieldname === 'avatar' || file.fieldname === 'profile') {
      destinationDir = path.join(baseUploadDir, 'avatars');
    } else if (file.fieldname === 'product' || file.fieldname === 'productImage') {
      destinationDir = path.join(baseUploadDir, 'products');
    } else if (file.fieldname === 'document') {
      destinationDir = path.join(baseUploadDir, 'documents');
    } else if (file.fieldname === 'video') {
      destinationDir = path.join(baseUploadDir, 'videos');
    } else if (ALLOWED_TYPES.images.mimes.includes(file.mimetype)) {
      destinationDir = path.join(baseUploadDir, 'products');
    } else if (ALLOWED_TYPES.documents.mimes.includes(file.mimetype)) {
      destinationDir = path.join(baseUploadDir, 'documents');
    } else if (ALLOWED_TYPES.videos.mimes.includes(file.mimetype)) {
      destinationDir = path.join(baseUploadDir, 'videos');
    } else {
      destinationDir = path.join(baseUploadDir, 'temp');
    }
    
    cb(null, destinationDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with user ID and timestamp
    const userId = req.user ? req.user.id : 'anonymous';
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    
    // Clean original filename (remove special chars, spaces)
    const cleanName = file.originalname
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .substring(0, 30);
    
    const filename = `${userId}-${cleanName}-${timestamp}-${randomString}${ext}`;
    cb(null, filename);
  }
});

// ------------------------------------------------------------------
// 4. FILE FILTER WITH CATEGORY SUPPORT
// ------------------------------------------------------------------
const fileFilter = (req, file, cb) => {
  // Check if we're expecting a specific type
  const fieldName = file.fieldname;
  
  // Avatar uploads - only images
  if (fieldName === 'avatar' || fieldName === 'profile') {
    if (ALLOWED_TYPES.images.mimes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      return cb(new Error('Avatar must be an image file (JPEG, PNG, GIF, WEBP, SVG)'), false);
    }
  }
  
  // Product images - only images
  if (fieldName === 'product' || fieldName === 'productImage' || fieldName === 'images') {
    if (ALLOWED_TYPES.images.mimes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      return cb(new Error('Product images must be image files'), false);
    }
  }
  
  // Documents
  if (fieldName === 'document') {
    if (ALLOWED_TYPES.documents.mimes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      return cb(new Error('Document must be PDF, DOC, DOCX, XLS, XLSX, TXT, or CSV'), false);
    }
  }
  
  // Videos
  if (fieldName === 'video') {
    if (ALLOWED_TYPES.videos.mimes.includes(file.mimetype)) {
      return cb(null, true);
    } else {
      return cb(new Error('Video must be MP4, MPEG, MOV, AVI, MKV, or WEBM'), false);
    }
  }
  
  // Generic check - accept images by default
  if (ALLOWED_TYPES.images.mimes.includes(file.mimetype)) {
    cb(null, true);
  } else if (ALLOWED_TYPES.documents.mimes.includes(file.mimetype)) {
    cb(null, true);
  } else if (ALLOWED_TYPES.videos.mimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed'), false);
  }
};

// ------------------------------------------------------------------
// 5. DYNAMIC LIMITS BASED ON FIELD
// ------------------------------------------------------------------
const getLimitsForField = (fieldName) => {
  if (fieldName === 'avatar' || fieldName === 'profile') {
    return { fileSize: MAX_IMAGE_SIZE };
  }
  if (fieldName === 'video') {
    return { fileSize: MAX_VIDEO_SIZE };
  }
  if (fieldName === 'document') {
    return { fileSize: MAX_DOCUMENT_SIZE };
  }
  return { fileSize: MAX_FILE_SIZE };
};

// ------------------------------------------------------------------
// 6. CREATE MULTER INSTANCE WITH DEFAULT CONFIG
// ------------------------------------------------------------------
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE // Default limit
  }
});

// ------------------------------------------------------------------
// 7. ENHANCED ERROR HANDLER
// ------------------------------------------------------------------
const handleMulterError = (err, req, res, next) => {
  if (!err) return next();

  // Multer specific errors
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB (10MB for images, 50MB for videos)'
        });
      
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files uploaded'
        });
      
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected field name. Expected: ' + err.field
        });
      
      case 'LIMIT_PART_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many parts in form data'
        });
      
      default:
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
    }
  }

  // Custom errors (from fileFilter)
  return res.status(400).json({
    success: false,
    message: err.message || 'File upload failed'
  });
};

// ------------------------------------------------------------------
// 8. SAFE WRAPPERS WITH CUSTOM LIMITS
// ------------------------------------------------------------------

/**
 * Upload single file with field-specific limits
 * @param {string} field - Field name (avatar, product, document, video)
 * @returns {Function} Express middleware
 */
const uploadSingle = (field = 'avatar') => {
  return (req, res, next) => {
    const limits = getLimitsForField(field);
    
    const customUpload = multer({
      storage,
      fileFilter,
      limits
    }).single(field);
    
    customUpload(req, res, (err) => {
      handleMulterError(err, req, res, next);
    });
  };
};

/**
 * Upload multiple files with same field name
 * @param {string} field - Field name
 * @param {number} maxCount - Maximum number of files
 * @returns {Function} Express middleware
 */
const uploadMultiple = (field = 'images', maxCount = 5) => {
  return (req, res, next) => {
    const limits = getLimitsForField(field);
    limits.files = maxCount;
    
    const customUpload = multer({
      storage,
      fileFilter,
      limits
    }).array(field, maxCount);
    
    customUpload(req, res, (err) => {
      handleMulterError(err, req, res, next);
    });
  };
};

/**
 * Upload multiple files with different field names
 * @param {Array} fields - Array of field configurations [{ name: 'avatar', maxCount: 1 }, { name: 'gallery', maxCount: 5 }]
 * @returns {Function} Express middleware
 */
const uploadFields = (fields) => {
  return (req, res, next) => {
    const customUpload = multer({
      storage,
      fileFilter,
      limits: { fileSize: MAX_FILE_SIZE }
    }).fields(fields);
    
    customUpload(req, res, (err) => {
      handleMulterError(err, req, res, next);
    });
  };
};

/**
 * Upload base64 encoded image
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
const uploadBase64 = async (req, res, next) => {
  try {
    const { image, field = 'avatar' } = req.body;
    
    if (!image) {
      return next();
    }
    
    // Check if it's a base64 string
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      return next(new Error('Invalid base64 image format'));
    }
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Check file size (base64 is ~33% larger than binary)
    const estimatedSize = buffer.length;
    const maxSize = field === 'avatar' ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
    
    if (estimatedSize > maxSize) {
      return next(new Error(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`));
    }
    
    // Check mime type
    if (!ALLOWED_TYPES.images.mimes.includes(mimeType)) {
      return next(new Error('Only image files are allowed'));
    }
    
    // Generate filename
    const userId = req.user ? req.user.id : 'anonymous';
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const ext = mimeType.split('/')[1];
    const filename = `${userId}-base64-${timestamp}-${randomString}.${ext}`;
    
    // Determine destination
    let destinationDir = path.join(baseUploadDir, 'avatars');
    if (field === 'product') {
      destinationDir = path.join(baseUploadDir, 'products');
    }
    
    // Save file
    const filePath = path.join(destinationDir, filename);
    fs.writeFileSync(filePath, buffer);
    
    // Attach file info to request
    req.file = {
      fieldname: field,
      originalname: `base64.${ext}`,
      encoding: 'base64',
      mimetype: mimeType,
      destination: destinationDir,
      filename: filename,
      path: filePath,
      size: estimatedSize
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Clean up old temporary files (call this periodically)
 * @param {number} maxAge - Maximum age in milliseconds (default: 24 hours)
 */
const cleanupTempFiles = (maxAge = 24 * 60 * 60 * 1000) => {
  const tempDir = path.join(baseUploadDir, 'temp');
  
  if (!fs.existsSync(tempDir)) return;
  
  const now = Date.now();
  
  fs.readdir(tempDir, (err, files) => {
    if (err) {
      console.error('Error reading temp directory:', err);
      return;
    }
    
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }
        
        const age = now - stats.mtimeMs;
        if (age > maxAge) {
          fs.unlink(filePath, err => {
            if (err) console.error('Error deleting temp file:', err);
          });
        }
      });
    });
  });
};

// ------------------------------------------------------------------
// 9. EXPORTS
// ------------------------------------------------------------------
module.exports = {
  upload,                     // Standard multer instance
  uploadSingle,               // Safe wrapper for single file upload
  uploadMultiple,             // Safe wrapper for multiple files
  uploadFields,               // Safe wrapper for multiple fields
  uploadBase64,               // Base64 image upload handler
  handleMulterError,          // Error handler
  cleanupTempFiles,           // Utility to clean temp files
  
  // Constants for external use
  ALLOWED_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_DOCUMENT_SIZE,
  
  // Helper to get file URL
  getFileUrl: (filename, type = 'avatar') => {
    if (!filename) return null;
    return `/uploads/${type}/${filename}`;
  },
  
  // Helper to delete file
  deleteFile: (filePath) => {
    return new Promise((resolve, reject) => {
      if (!filePath) return resolve();
      
      const fullPath = path.isAbsolute(filePath) 
        ? filePath 
        : path.join(baseUploadDir, filePath);
      
      fs.unlink(fullPath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error('Error deleting file:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
};