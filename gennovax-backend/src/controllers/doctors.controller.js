import * as doctorsService from '../services/doctors.service.js';

function sendMappedError(res, next, error) {
  const mapped = doctorsService.mapDoctorError(error);
  if (mapped) {
    return res.status(mapped.status).json({ message: mapped.message });
  }

  if (error?.status) {
    return res.status(error.status).json({ message: error.message });
  }

  return next(error);
}

export async function getDoctorRevenueAnalytics(req, res, next) {
  try {
    const data = await doctorsService.getDoctorRevenueAnalytics(req);
    res.json(data);
  } catch (error) {
    sendMappedError(res, next, error);
  }
}

export async function listDoctors(req, res, next) {
  try {
    const data = await doctorsService.listDoctors(req);
    res.json(data);
  } catch (error) {
    sendMappedError(res, next, error);
  }
}

export async function getDoctor(req, res, next) {
  try {
    const data = await doctorsService.getDoctor(req);
    res.json(data);
  } catch (error) {
    sendMappedError(res, next, error);
  }
}

export async function createDoctor(req, res, next) {
  try {
    const data = await doctorsService.createDoctor(req);
    res.json(data);
  } catch (error) {
    sendMappedError(res, next, error);
  }
}

export async function updateDoctor(req, res, next) {
  try {
    const data = await doctorsService.updateDoctor(req);
    res.json(data);
  } catch (error) {
    sendMappedError(res, next, error);
  }
}

export async function listDoctorServices(req, res, next) {
  try {
    const data = await doctorsService.listDoctorServices(req);
    res.json(data);
  } catch (error) {
    sendMappedError(res, next, error);
  }
}

export async function upsertDoctorService(req, res, next) {
  try {
    const data = await doctorsService.upsertDoctorService(req);
    res.json(data);
  } catch (error) {
    sendMappedError(res, next, error);
  }
}

export async function deleteDoctorService(req, res, next) {
  try {
    const data = await doctorsService.deleteDoctorService(req);
    res.json(data);
  } catch (error) {
    sendMappedError(res, next, error);
  }
}

export async function deleteDoctor(req, res, next) {
  try {
    const data = await doctorsService.deleteDoctor(req);
    res.json(data);
  } catch (error) {
    sendMappedError(res, next, error);
  }
}
