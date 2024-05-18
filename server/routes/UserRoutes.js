import express from "express";
import asyncHandler from "express-async-handler";
import { registerUser, loginUser } from "../controllers/UserController.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", asyncHandler(registerUser));

//router.get('/profile', auth, asyncHandler(getProfile));

export default router;
