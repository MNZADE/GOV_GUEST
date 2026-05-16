import multer from "multer";
import path from "path";
import fs from "fs";

/* =========================================================
   CREATE UPLOADS FOLDER IF NOT EXISTS
========================================================= */

const uploadPath = "uploads";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}

/* =========================================================
   STORAGE CONFIGURATION
========================================================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    try {
      // Generate Unique Filename
      const uniqueName =
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9);

      // Extract File Extension
      const extension =
        path.extname(file.originalname).toLowerCase();

      // Final Filename
      const finalName =
        uniqueName + extension;

      cb(null, finalName);
    } catch (error) {
      cb(error);
    }
  },
});

/* =========================================================
   FILE FILTER
========================================================= */

const fileFilter = (
  req,
  file,
  cb
) => {
  try {
    // Allowed Image Types
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    // Check Mime Type
    if (
      allowedMimeTypes.includes(
        file.mimetype
      )
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only JPG, JPEG, PNG, and WEBP images are allowed"
        ),
        false
      );
    }
  } catch (error) {
    cb(error, false);
  }
};

/* =========================================================
   MULTER CONFIGURATION
========================================================= */

export const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize:
      5 * 1024 * 1024, // 5MB
  },
});

/* =========================================================
   OPTIONAL ERROR HANDLER
========================================================= */

export const handleMulterError = (
  err,
  req,
  res,
  next
) => {
  if (
    err instanceof multer.MulterError
  ) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};