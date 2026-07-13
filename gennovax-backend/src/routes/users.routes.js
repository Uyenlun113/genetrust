import express from 'express';
import {
  createUser,
  deleteUser,
  listUsers,
  resolveUserPasswordReset,
  updateUser,
} from '../controllers/users.controller.js';

const router = express.Router();

router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/:id/password-reset/resolve', resolveUserPasswordReset);

export default router;
