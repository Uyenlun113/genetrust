import { Router } from 'express';
import multer from 'multer';
import { deleteCaseFile, uploadCaseFile } from '../controllers/upload.controller.js';

const router = Router();
const upload = multer({ dest: 'temp/' });

router.post('/', upload.single('file'), uploadCaseFile);
router.post('/delete', deleteCaseFile);

export default router;
