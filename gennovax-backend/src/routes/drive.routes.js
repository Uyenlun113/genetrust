import { Router } from 'express';
import multer from 'multer';
import {
  createDriveFolder,
  deleteDriveItem,
  listDriveItems,
  uploadDriveFile,
} from '../controllers/drive.controller.js';

const router = Router();
const upload = multer({ dest: 'temp/' });

router.get('/list', listDriveItems);
router.post('/create-folder', createDriveFolder);
router.post('/upload', upload.single('file'), uploadDriveFile);
router.post('/delete', deleteDriveItem);

export default router;
