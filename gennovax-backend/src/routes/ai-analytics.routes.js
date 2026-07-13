import { Router } from 'express';
import { askAnalytics, askInfo } from '../controllers/ai-analytics.controller.js';

const router = Router();

router.post('/ask', askAnalytics);
router.post('/ask-info', askInfo);

export default router;
