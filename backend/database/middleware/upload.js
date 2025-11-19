import multer from "multer";
import path from "path";

// Carpeta donde se guardarán las fotos
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const unique = Date.now() + path.extname(file.originalname);
    cb(null, unique);
  },
});

export const upload = multer({ storage });
