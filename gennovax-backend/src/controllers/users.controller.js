import * as usersService from '../services/users.service.js';

function sendError(res, next, error) {
  if (error?.status) {
    return res.status(error.status).json({ message: error.message });
  }
  return next(error);
}

export async function listUsers(req, res, next) {
  try {
    const data = await usersService.listUsers();
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function createUser(req, res, next) {
  try {
    const data = await usersService.createUser(req.body);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const data = await usersService.updateUser(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const data = await usersService.deleteUser(req.params.id);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function resolveUserPasswordReset(req, res, next) {
  try {
    const data = await usersService.resolveUserPasswordReset(
      req.params.id,
      req.user,
      req.body,
    );
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}
