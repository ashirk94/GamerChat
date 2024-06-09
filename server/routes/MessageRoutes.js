import express from "express";
import {
	saveMessage,
	getMessages,
	clearMessages,
	markMessagesAsSeen,
	deleteMessages
} from "../controllers/MessageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, saveMessage); // POST /api/messages
router.get("/:displayName", protect, getMessages); // GET /api/messages/:displayName
router.post("/clear", protect, clearMessages); // POST /api/messages/clear
router.post("/delete", protect, deleteMessages); // POST /api/messages/delete
router.post("/seen", protect, markMessagesAsSeen); // POST /api/messages/seen

export default router;
