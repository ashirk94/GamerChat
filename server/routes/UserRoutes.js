import express from "express";
import {
	authUser,
	registerUser,
	loginUser,
	logoutUser,
	getUserProfile,
	checkUserExists,
	updateUserProfile
} from "../controllers/UserController.js";

const router = express.Router();

router.post("/", registerUser);
router.post("/auth", loginUser);
router.post("/auth", logoutUser);
router.get("/profile", getUserProfile);
router.put("/profile", updateUserProfile);
router.route("/:displayName").get(checkUserExists);
router.post("/logout", logoutUser);

export default router;
