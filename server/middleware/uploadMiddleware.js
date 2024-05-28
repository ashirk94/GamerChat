import multer from "multer";

const limits = { fileSize: 10 * 1024 * 1024 }; // Limits file size to 10MB
const storage = multer.memoryStorage(); // Stores files in memory
const upload = multer({ storage, limits });

export { upload };
