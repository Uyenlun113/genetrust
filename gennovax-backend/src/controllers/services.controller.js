import * as servicesService from '../services/services.service.js';

function sendError(res, next, error) {
  const mapped = servicesService.mapServiceError(error);
  if (mapped) {
    return res.status(mapped.status).json({ message: mapped.message });
  }

  return next(error);
}

export async function listServices(req, res, next) {
  try {
    const data = await servicesService.listServices(req.query);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function createService(req, res, next) {
  try {
    const data = await servicesService.createService(req.body);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function updateService(req, res, next) {
  try {
    const data = await servicesService.updateService(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function deleteService(req, res, next) {
  try {
    const data = await servicesService.deleteService(req.params.id);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}
