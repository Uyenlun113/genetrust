import * as authService from '../services/auth.service.js';

function sendError(res, next, error) {
  if (error?.status) {
    return res.status(error.status).send(error.message);
  }
  return next(error);
}

function sendJsonError(res, next, error) {
  if (error?.status) {
    return res.status(error.status).json({ message: error.message });
  }
  return next(error);
}

export async function login(req, res, next) {
  try {
    const data = await authService.login(req.body);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function createForgotPasswordRequest(req, res, next) {
  try {
    const data = await authService.createForgotPasswordRequest(req.body);
    res.json(data);
  } catch (error) {
    sendJsonError(res, next, error);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    const data = await authService.getCurrentUser(req.headers);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const data = await authService.updateProfile(req.headers, req.body);
    res.json(data);
  } catch (error) {
    if (error?.status) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: error.message || 'Lỗi server' });
  }
}
