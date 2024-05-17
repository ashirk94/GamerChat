import express from 'express';
const router = express.Router();
import { join } from 'path';

// Define route for ChatPage
router.get('/test', (req, res) => {
  res.sendFile(join(__dirnamed, '../chat.html'));
});

export default router;
