import express from 'express';
import { getNotifications, markAsViewed } from './notifications.controller.js';
import RequireAuth from '../../global/middlewares/RequireAuth.js';

const router = express.Router();

router.get('/', RequireAuth, getNotifications);
router.post('/mark-as-viewed', RequireAuth, markAsViewed);

export default router;
