import { Router } from 'express';
import { requireRole } from '../middlewares/auth.middleware.js';
import {
  createService,
  deleteService,
  listServices,
  updateService,
} from '../controllers/services.controller.js';

const router = Router();

router.get('/', listServices);
router.post('/', requireRole('admin', 'super_admin'), createService);
router.patch('/:id', requireRole('admin', 'super_admin'), updateService);
router.delete('/:id', requireRole('admin', 'super_admin'), deleteService);

export default router;
