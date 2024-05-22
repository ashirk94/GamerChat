import express from "express";
import { saveMessage, getMessages, clearMessages, markMessagesAsSeen, deleteMessages } from "../controllers/messageController.js";

const router = express.Router();

router.route("/").post(saveMessage); // POST /api/messages
router.route("/:displayName").get(getMessages); // GET /api/messages/:displayName
router.route("/clear").post(clearMessages); // POST /api/messages/clear
router.route("/delete").post(deleteMessages); // POST /api/messages/delete
router.route("/seen").post(markMessagesAsSeen); // POST /api/messages/seen

export default router;
