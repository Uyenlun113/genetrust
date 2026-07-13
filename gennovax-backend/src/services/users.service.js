import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function canManageUser(actor, targetUser) {
  if (!actor?.id || !targetUser?._id) return false;
  if (String(actor.id) === String(targetUser._id)) return false;
  if (actor.role === 'super_admin') return true;

  if (
    (actor.role === 'admin' || actor.role === 'accounting_admin') &&
    ['staff', 'sales'].includes(targetUser.role)
  ) {
    return true;
  }

  return false;
}

export async function listUsers() {
  const users = await User.find({})
    .select('-passwordHash')
    .sort({ createdAt: -1 })
    .lean();

  return { items: users };
}

export async function createUser(body = {}) {
  const { name, email, password, role } = body;

  const exist = await User.findOne({ email });
  if (exist) throw createHttpError(400, 'Email đã tồn tại!');

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    name,
    email,
    passwordHash,
    role: role || 'staff',
  });

  const userObj = newUser.toObject();
  delete userObj.passwordHash;
  return userObj;
}

export async function updateUser(id, body = {}) {
  const { name, role, isActive, newPassword } = body;
  const updateData = {};

  if (name) updateData.name = name;
  if (role) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (newPassword) {
    updateData.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  return User.findByIdAndUpdate(id, updateData, {
    new: true,
  })
    .select('-passwordHash')
    .lean();
}

export async function deleteUser(id) {
  await User.findByIdAndDelete(id);
  return { ok: true };
}

export async function resolveUserPasswordReset(id, actorUser, body = {}) {
  const { newPassword } = body;
  if (!String(newPassword || '').trim()) {
    throw createHttpError(400, 'Vui lòng nhập mật khẩu mới.');
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    throw createHttpError(404, 'Không tìm thấy tài khoản.');
  }

  if (!canManageUser(actorUser, targetUser)) {
    throw createHttpError(403, 'Bạn không có quyền xử lý yêu cầu này.');
  }

  if (targetUser.passwordResetRequest?.status !== 'pending') {
    throw createHttpError(
      400,
      'Tài khoản này hiện không có yêu cầu cấp lại mật khẩu.',
    );
  }

  const actor = await User.findById(actorUser.id).select('name role').lean();

  targetUser.passwordHash = await bcrypt.hash(String(newPassword), 10);
  targetUser.passwordResetRequest = {
    status: 'completed',
    requestedAt: targetUser.passwordResetRequest?.requestedAt || new Date(),
    resolvedAt: new Date(),
    resolvedBy: {
      id: String(actorUser.id),
      name: actor?.name || null,
      role: actor?.role || actorUser.role || null,
    },
  };

  await targetUser.save();

  const userObj = targetUser.toObject();
  delete userObj.passwordHash;

  return {
    item: userObj,
    message: 'Đã cấp lại mật khẩu cho tài khoản.',
  };
}
