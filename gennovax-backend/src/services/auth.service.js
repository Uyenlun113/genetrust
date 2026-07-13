import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  );
}

function getBearerToken(headers = {}) {
  const auth = headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : '';
}

export async function login(body = {}) {
  const { email, password } = body;
  const user = await User.findOne({ email, isActive: true });
  if (!user) throw createHttpError(401, 'Sai email hoặc mật khẩu.');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw createHttpError(401, 'Sai email hoặc mật khẩu.');

  const token = signToken(user);
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function createForgotPasswordRequest(body = {}) {
  const email = String(body?.email || '').trim().toLowerCase();
  if (!email) {
    throw createHttpError(400, 'Vui lòng nhập email tài khoản.');
  }

  const user = await User.findOne({ email, isActive: true });
  if (!user) {
    throw createHttpError(
      404,
      'Không tìm thấy tài khoản đang hoạt động với email này.',
    );
  }

  if (user.passwordResetRequest?.status === 'pending') {
    return {
      status: 'pending',
      requestedAt: user.passwordResetRequest.requestedAt,
      message: 'Yêu cầu cấp lại mật khẩu đang được xử lý.',
    };
  }

  user.passwordResetRequest = {
    status: 'pending',
    requestedAt: new Date(),
    resolvedAt: null,
    resolvedBy: {
      id: null,
      name: null,
      role: null,
    },
  };

  await user.save();

  return {
    status: 'created',
    requestedAt: user.passwordResetRequest.requestedAt,
    message: 'Yêu cầu cấp lại mật khẩu đã được ghi nhận.',
  };
}

export async function getCurrentUser(headers = {}) {
  const token = getBearerToken(headers);
  if (!token) throw createHttpError(401, 'No token');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Invalid token');
  }

  const user = await User.findById(payload.sub).lean();
  if (!user) throw createHttpError(401, 'User not found');

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function updateProfile(headers = {}, body = {}) {
  const token = getBearerToken(headers);
  if (!token) throw createHttpError(401, 'No token');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw createHttpError(401, 'Invalid token');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw createHttpError(404, 'User not found');

  const { name, oldPassword, newPassword } = body;

  if (name) user.name = name;

  if (oldPassword && newPassword) {
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      throw createHttpError(400, 'Mật khẩu cũ không chính xác!');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  await user.save();
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
