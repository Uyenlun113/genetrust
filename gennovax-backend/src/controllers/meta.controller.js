import * as metaService from '../services/meta.service.js';

function sendError(res, next, error) {
  if (error?.status) {
    return res.status(error.status).json({ message: error.message });
  }
  return next(error);
}

export async function getOptionsMap(req, res, next) {
  try {
    const data = await metaService.getOptionsMap();
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function listOptionsAdmin(req, res, next) {
  try {
    const data = await metaService.listOptionsAdmin();
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function getOptionsAdminKey(req, res, next) {
  try {
    const data = await metaService.getOptionsAdminKey(req.params.key);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function upsertOptionsAdminKey(req, res, next) {
  try {
    const data = await metaService.upsertOptionsAdminKey(req.params.key, req.body);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function addOptionsAdminItem(req, res, next) {
  try {
    const data = await metaService.addOptionsAdminItem(req.params.key, req.body);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function patchOptionsAdminItem(req, res, next) {
  try {
    const data = await metaService.patchOptionsAdminItem(
      req.params.key,
      req.params.value,
      req.body,
    );
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function createOptionsAdminKey(req, res, next) {
  try {
    const data = await metaService.createOptionsAdminKey(req.body);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function renameOptionsAdminKey(req, res, next) {
  try {
    const data = await metaService.renameOptionsAdminKey(req.params.key, req.body);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function deleteOptionsAdminItem(req, res, next) {
  try {
    const data = await metaService.deleteOptionsAdminItem(
      req.params.key,
      req.params.value,
    );
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function deleteOptionsAdminKey(req, res, next) {
  try {
    const data = await metaService.deleteOptionsAdminKey(req.params.key);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}
