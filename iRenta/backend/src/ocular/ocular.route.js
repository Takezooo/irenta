// backend/src/ocular/ocular.router.js
import express from 'express';
import { ScheduleOcular, GetReservedDates } from './ocular.controller.js';
import RequireAuth from '../../global/middlewares/RequireAuth.js';

const router = express.Router();

router.post('/schedule', RequireAuth, ScheduleOcular);
router.get('/reserved-dates/:propertyId', GetReservedDates);

export default router;
