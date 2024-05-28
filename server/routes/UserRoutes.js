import express from "express";
import {
	registerUser,
	loginUser,
	logoutUser,
	updateUserProfile,
	getUserProfile
} from "../controllers/UserController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Be careful using parameters, the /:displayName blocked other routes
router.post("/", registerUser);
router.post("/auth", loginUser);
router.post("/logout", logoutUser);
router.get("/profile", protect, getUserProfile);
router.put(
	"/profile",
	protect,
	upload.single("profilePicture"),
	updateUserProfile
);

export default router;
