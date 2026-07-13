import { Router } from 'express';
import {
  listInventoryCases,
  listInventorySources,
} from '../controllers/inventory.controller.js';

const router = Router();

router.get('/cases', listInventoryCases);
router.get('/sources', listInventorySources);

export default router;
