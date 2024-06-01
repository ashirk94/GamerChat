import express from "express";
import {
	registerUser,
	loginUser,
	logoutUser,
	getUserByDisplayName,
	updateUserProfile,
	getUserProfile
} from "../controllers/UserController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

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
router.get("/user/:displayName", getUserByDisplayName);

export default router;
