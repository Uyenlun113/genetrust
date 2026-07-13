import { Router } from 'express';
import { requireRole } from '../middlewares/auth.middleware.js';
import {
  createDoctor,
  deleteDoctor,
  deleteDoctorService,
  getDoctor,
  getDoctorRevenueAnalytics,
  listDoctors,
  listDoctorServices,
  updateDoctor,
  upsertDoctorService,
} from '../controllers/doctors.controller.js';

const router = Router();

router.get(
  '/analytics/revenue',
  requireRole('admin', 'super_admin', 'sales'),
  getDoctorRevenueAnalytics,
);

router.get('/', listDoctors);
router.get('/:id', getDoctor);
router.post('/', requireRole('admin', 'super_admin', 'sales'), createDoctor);
router.patch(
  '/:id',
  requireRole('admin', 'super_admin', 'sales'),
  updateDoctor,
);
router.get('/:id/services', listDoctorServices);
router.put(
  '/:id/services/:serviceId',
  requireRole('admin', 'super_admin', 'sales'),
  upsertDoctorService,
);
router.delete(
  '/:id/services/:serviceId',
  requireRole('admin', 'super_admin', 'sales'),
  deleteDoctorService,
);
router.delete(
  '/:id',
  requireRole('admin', 'super_admin', 'sales'),
  deleteDoctor,
);

export default router;
