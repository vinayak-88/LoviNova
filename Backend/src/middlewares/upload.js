const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

const uploadPath = process.env.UPLOAD_PATH
  ? path.isAbsolute(process.env.UPLOAD_PATH)
    ? process.env.UPLOAD_PATH
    : path.join(process.cwd(), process.env.UPLOAD_PATH)
  : path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(12, (err, bytes) => {
      if (err) return cb(err, null);
      const uniqueName =
        bytes.toString("hex") + path.extname(file.originalname);
      cb(null, uniqueName);
    });
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) cb(null, true);
  else cb(new Error("Only images (jpg, jpeg, png, webp) are allowed"));
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
