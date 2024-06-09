import express from 'express';
const router = express.Router();
import {
    createGroup,
    sendMessageToGroup,
    getGroupMessages,
    getGroups,
    getGroupById,
    addUserToGroup
} from '../controllers/GroupController.js';
import { protect } from '../middleware/authMiddleware.js';

router.route('/').post(protect, createGroup).get(protect, getGroups);
router.route('/:id').get(protect, getGroupById);
router.route('/:id/add-user').put(protect, addUserToGroup);
router.route('/:groupId/message').post(protect, sendMessageToGroup);
router.route('/:groupId/messages').get(protect, getGroupMessages);

export default router;
