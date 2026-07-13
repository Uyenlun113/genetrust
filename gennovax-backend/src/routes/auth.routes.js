import express from 'express';
import {
  createForgotPasswordRequest,
  getCurrentUser,
  login,
  updateProfile,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/login', login);
router.post('/forgot-password-request', createForgotPasswordRequest);
router.get('/me', getCurrentUser);
router.put('/profile', updateProfile);

export default router;
