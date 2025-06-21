const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Utility: check file type
const isValidFileType = (file, types) => {
  const extname = types.test(path.extname(file.originalname).toLowerCase());
  const mimetype = types.test(file.mimetype);
  return extname && mimetype;
};

const checkFileType = (file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf/;
  cb(null, isValidFileType(file, allowed));
};

const checkFileTypeProfilePic = (file, cb) => {
  const allowed = /jpeg|jpg|png/;
  cb(null, isValidFileType(file, allowed));
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userEmail = req.user.email.toLowerCase();
    let dir;

    if (file.fieldname === 'photo') {
      dir = `./public/uploads/${userEmail}/${file.fieldname}`;
    } else if (file.fieldname === 'profilePic') {
      dir = `./public/uploads/${userEmail}/${file.fieldname}`;
    } else {
      const { name } = req.body;
      const dname = name.toLowerCase();
      dir = `./public/uploads/${userEmail}/${dname}/${file.fieldname}`;
    }

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },

  filename: (req, file, cb) => {
    if (file.fieldname === 'profilePic') {
      const filename = `ProfilePic_${file.originalname}`;
      req.user.profilePic = filename;
      cb(null, filename);
    } else {
      const filename = `File-${uuidv4()}-${file.originalname}`;
      cb(null, filename);
    }
  }
});

// Multer middleware instance
const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 }, // 6MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'profilePic') {
      checkFileTypeProfilePic(file, cb);
    } else {
      checkFileType(file, cb);
    }
  }
});

module.exports = upload;
