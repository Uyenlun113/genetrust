import { Router } from 'express';
import {
  addOptionsAdminItem,
  createOptionsAdminKey,
  deleteOptionsAdminItem,
  deleteOptionsAdminKey,
  getOptionsAdminKey,
  getOptionsMap,
  listOptionsAdmin,
  patchOptionsAdminItem,
  renameOptionsAdminKey,
  upsertOptionsAdminKey,
} from '../controllers/meta.controller.js';

const router = Router();

router.get('/options', getOptionsMap);
router.get('/options-admin', listOptionsAdmin);
router.get('/options-admin/:key', getOptionsAdminKey);
router.put('/options-admin/:key', upsertOptionsAdminKey);
router.post('/options-admin/:key/items', addOptionsAdminItem);
router.patch('/options-admin/:key/items/:value', patchOptionsAdminItem);
router.post('/options-admin', createOptionsAdminKey);
router.patch('/options-admin/:key', renameOptionsAdminKey);
router.delete('/options-admin/:key/items/:value', deleteOptionsAdminItem);
router.delete('/options-admin/:key', deleteOptionsAdminKey);

export default router;
