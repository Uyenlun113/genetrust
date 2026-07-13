import * as casesService from '../services/cases.service.js';

function sendError(res, next, error) {
  if (error?.status) {
    return res.status(error.status).json({ message: error.message });
  }
  return next(error);
}

export async function getCasesAnalytics(req, res, next) {
  try {
    const data = await casesService.getCasesAnalytics(req.query);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function getLegacyFollowUpUnused(req, res, next) {
  try {
    const data = await casesService.getLegacyFollowUpUnused(req);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function listCases(req, res, next) {
  try {
    const data = await casesService.listCases(req.query);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function getLegacyRootUnused(req, res, next) {
  try {
    const data = await casesService.getLegacyRootUnused(req.query);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function startCaseMailTracking(req, res, next) {
  try {
    const data = await casesService.startCaseMailTracking(
      req.params.id,
      req.body,
    );
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function checkCaseMailTracking(req, res, next) {
  try {
    const data = await casesService.checkCaseMailTracking(
      req.params.id,
      req.body,
    );
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function stopCaseMailTracking(req, res, next) {
  try {
    const data = await casesService.stopCaseMailTracking(req.params.id);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function createCase(req, res, next) {
  try {
    const data = await casesService.createCase(req.body || {});
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function updateCase(req, res, next) {
  try {
    const data = await casesService.updateCase(req.params.id, req.body || {});
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}

export async function deleteCase(req, res, next) {
  try {
    const data = await casesService.deleteCase(req.params.id);
    res.json(data);
  } catch (error) {
    sendError(res, next, error);
  }
}
