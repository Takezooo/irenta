import multer from "multer";

export default multer({
  storage: multer.diskStorage({}), // Default disk storage
  fileFilter: (req, file, cb) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg"]; // Allowed MIME types
    if (validTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      cb(new Error("Invalid file type. Only PNG, JPG, and JPEG are allowed."), false); // Reject the file
    }
  },
});
