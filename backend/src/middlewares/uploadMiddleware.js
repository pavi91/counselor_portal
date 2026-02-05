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
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, and DOCX files are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
  fileFilter: fileFilter
});

// Middleware for application files
const uploadApplicationFiles = upload.fields([
  { name: 'fileResidence', maxCount: 1 },
  { name: 'fileIncome', maxCount: 1 },
  { name: 'fileSiblings', maxCount: 1 },
  { name: 'fileSamurdhi', maxCount: 1 },
  { name: 'fileSports', maxCount: 1 },
  // Support snake_case names used in the frontend
  { name: 'file_residence', maxCount: 1 },
  { name: 'file_income', maxCount: 1 },
  { name: 'file_siblings', maxCount: 1 },
  { name: 'file_samurdhi', maxCount: 1 },
  { name: 'file_sports', maxCount: 1 },
  // Other optional attachments from the form
  { name: 'file_parentDeath', maxCount: 1 },
  { name: 'file_parentMedical', maxCount: 1 },
  { name: 'file_siblingMedical', maxCount: 1 },
  { name: 'file_special', maxCount: 1 }
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
