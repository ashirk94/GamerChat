import express from "express";
import multer from "multer";
import {
	registerUser,
	loginUser,
	logoutUser,
	checkUserExists,
	updateUserProfile
} from "../controllers/UserController.js";
import { protect } from "../middleware/authMiddleware.js";

// multer for file uploads
const upload = multer({
	limits: { fileSize: 10 * 1024 * 1024 }, // Limits file size to 10MB
	storage: multer.memoryStorage()
});

const router = express.Router();

router.post("/", registerUser);
router.post("/auth", loginUser);
router.route("/:displayName").get(checkUserExists);
router.post("/logout", logoutUser);
router.route("/profile").put(protect, updateUserProfile);

export default router;
