import Service from '../models/Service.model.js';

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function mapServiceError(error) {
  if (error?.code === 11000) {
    return { status: 400, message: 'Mã dịch vụ đã tồn tại.' };
  }

  if (error?.status) {
    return { status: error.status, message: error.message };
  }

  return null;
}

export async function listServices(query = {}) {
  const { search = '', all = '' } = query;
  const mongoQuery = {};

  if (all !== '1') mongoQuery.isActive = true;

  if (search) {
    mongoQuery.$or = [
      { serviceCode: { $regex: String(search), $options: 'i' } },
      { name: { $regex: String(search), $options: 'i' } },
    ];
  }

  const items = await Service.find(mongoQuery).sort({ createdAt: -1 }).lean();
  return { items };
}

export async function createService(body = {}) {
  const payload = {
    serviceCode: String(body?.serviceCode || '').trim(),
    name: String(body?.name || '').trim(),
    serviceType: body?.serviceType,
    turnaroundHours: Number(body?.turnaroundHours ?? 48),
    note: String(body?.note || '').trim(),
    isActive: body?.isActive !== false,
  };

  if (!payload.serviceCode || !payload.name || !payload.serviceType) {
    throw createHttpError(400, 'Thiếu thông tin dịch vụ.');
  }

  return Service.create(payload);
}

export async function updateService(id, body = {}) {
  const patch = {};

  if ('serviceCode' in body) patch.serviceCode = String(body.serviceCode || '').trim();
  if ('name' in body) patch.name = String(body.name || '').trim();
  if ('serviceType' in body) patch.serviceType = body.serviceType;
  if ('turnaroundHours' in body) {
    patch.turnaroundHours = Number(body.turnaroundHours ?? 48);
  }
  if ('note' in body) patch.note = String(body.note || '').trim();
  if ('isActive' in body) patch.isActive = body.isActive !== false;

  const updated = await Service.findByIdAndUpdate(id, patch, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updated) throw createHttpError(404, 'Not found');
  return updated;
}

export async function deleteService(id) {
  await Service.findByIdAndDelete(id);
  return { ok: true };
}
