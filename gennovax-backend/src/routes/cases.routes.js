import { Router } from 'express';
import {
  checkCaseMailTracking,
  createCase,
  deleteCase,
  getCasesAnalytics,
  getLegacyFollowUpUnused,
  getLegacyRootUnused,
  listCases,
  startCaseMailTracking,
  stopCaseMailTracking,
  updateCase,
} from '../controllers/cases.controller.js';

const router = Router();

router.get('/analytics', getCasesAnalytics);
router.get('/legacy-follow-up-unused', getLegacyFollowUpUnused);
router.get('/', listCases);
router.get('/legacy-root-unused', getLegacyRootUnused);

router.post('/:id/mail-tracking/start', startCaseMailTracking);
router.post('/:id/mail-tracking/check', checkCaseMailTracking);
router.post('/:id/mail-tracking/stop', stopCaseMailTracking);

router.post('/', createCase);
router.patch('/:id', updateCase);
router.delete('/:id', deleteCase);

export default router;
