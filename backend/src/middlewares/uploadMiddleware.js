const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure filestore directory exists
const filestoreDir = path.join(__dirname, '../../filestore');
if (!fs.existsSync(filestoreDir)) {
  fs.mkdirSync(filestoreDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, filestoreDir);
  },
  filename: function (req, file, cb) {
    // Extract userId from request (could be from params, body, or authenticated user)
    const userId = req.params.userId || req.body.userId || req.body.studentId || req.user?.id || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${userId}_${timestamp}${ext}`;
    cb(null, filename);
  }
});

// File filter - accept only specific file types
const fileFilter = (req, file, cb) => {
  const allowedExtensions = new Set(['.jpeg', '.jpg', '.png', '.pdf', '.doc', '.docx']);
  const allowedMimeTypes = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]);

  const extension = path.extname(file.originalname).toLowerCase();
  const hasValidExtension = allowedExtensions.has(extension);
  const hasValidMimeType = allowedMimeTypes.has(file.mimetype);
  const isGenericWordMime = file.mimetype === 'application/octet-stream' && (extension === '.doc' || extension === '.docx');

  if (hasValidExtension && (hasValidMimeType || isGenericWordMime)) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, and DOCX files are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max file size
  },
  fileFilter: fileFilter
});

// Dedicated upload config for hostel applications.
// Each individual field allows up to 5 files (enforced via maxCount below).
const uploadApplication = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max file size per file
  },
  fileFilter: fileFilter
});

// Middleware for application files
const uploadApplicationFiles = uploadApplication.fields([
  { name: 'fileResidence', maxCount: 5 },
  { name: 'fileIncome', maxCount: 5 },
  { name: 'fileSiblings', maxCount: 5 },
  { name: 'fileSamurdhi', maxCount: 5 },
  { name: 'fileSports', maxCount: 5 },
  // Support snake_case names used in the frontend
  { name: 'file_residence', maxCount: 5 },
  { name: 'file_income', maxCount: 5 },
  { name: 'file_siblings', maxCount: 5 },
  { name: 'file_samurdhi', maxCount: 5 },
  { name: 'file_sports', maxCount: 5 },
  // Other optional attachments from the form
  { name: 'file_parentDeath', maxCount: 5 },
  { name: 'file_parentMedical', maxCount: 5 },
  { name: 'file_siblingMedical', maxCount: 5 },
  { name: 'file_special', maxCount: 5 }
]);

// Middleware for ticket attachment (single file)
const uploadTicketAttachment = upload.single('attachment');

// Middleware for role request attachment (single file)
const uploadRoleRequestAttachment = upload.single('attachment');

module.exports = {
  uploadApplicationFiles,
  uploadTicketAttachment,
  uploadRoleRequestAttachment
};
