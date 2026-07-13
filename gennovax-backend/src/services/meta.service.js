import Option from '../models/Option.model.js';

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export async function getOptionsMap() {
  const docs = await Option.find({}).lean();
  const map = {};

  for (const d of docs) {
    map[d.key] = (d.items || [])
      .filter((x) => x.isActive !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((x) => ({ label: x.label, value: x.value }));
  }

  return map;
}

export async function listOptionsAdmin() {
  const items = await Option.find({}).sort({ key: 1 }).lean();
  return { items };
}

export async function getOptionsAdminKey(key) {
  const doc = await Option.findOne({ key }).lean();
  if (!doc) throw createHttpError(404, 'Not found');
  return doc;
}

export async function upsertOptionsAdminKey(key, body = {}) {
  const { items = [] } = body;

  return Option.findOneAndUpdate({ key }, { key, items }, { new: true, upsert: true }).lean();
}

export async function addOptionsAdminItem(key, body = {}) {
  const { label, value, order = 0, isActive = true } = body;
  if (!label || !value) {
    throw createHttpError(400, 'label/value required');
  }

  return Option.findOneAndUpdate(
    { key },
    {
      $setOnInsert: { key },
      $push: { items: { label, value, order, isActive } },
    },
    { new: true, upsert: true },
  ).lean();
}

export async function patchOptionsAdminItem(key, value, patch = {}) {
  const doc = await Option.findOne({ key });
  if (!doc) throw createHttpError(404, 'Not found');

  const idx = (doc.items || []).findIndex((x) => x.value === value);
  if (idx < 0) throw createHttpError(404, 'Item not found');

  if ('label' in patch) doc.items[idx].label = patch.label;
  if ('order' in patch) doc.items[idx].order = patch.order;
  if ('isActive' in patch) doc.items[idx].isActive = patch.isActive;

  await doc.save();
  return doc.toObject();
}

export async function createOptionsAdminKey(body = {}) {
  const { key, name } = body;
  if (!key || !name) {
    throw createHttpError(400, 'Cần nhập đủ key và name');
  }

  const existing = await Option.findOne({ key });
  if (existing) {
    throw createHttpError(400, 'Key này đã tồn tại!');
  }

  return Option.create({ key, name, items: [] });
}

export async function renameOptionsAdminKey(key, body = {}) {
  const { name } = body;
  if (!name) throw createHttpError(400, 'Cần nhập tên mới');

  const doc = await Option.findOneAndUpdate({ key }, { name }, { new: true }).lean();
  if (!doc) throw createHttpError(404, 'Không tìm thấy danh mục');
  return doc;
}

export async function deleteOptionsAdminItem(key, value) {
  const doc = await Option.findOneAndUpdate(
    { key },
    { $pull: { items: { value } } },
    { new: true },
  ).lean();

  if (!doc) throw createHttpError(404, 'Not found');
  return doc;
}

export async function deleteOptionsAdminKey(key) {
  await Option.deleteOne({ key });
  return { ok: true };
}
