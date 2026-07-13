import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'staff', 'super_admin', 'accounting_admin', 'sales'],
      required: true,
    },
    isActive: { type: Boolean, default: true },
    passwordResetRequest: {
      status: {
        type: String,
        enum: ['idle', 'pending', 'completed'],
        default: 'idle',
      },
      requestedAt: { type: Date, default: null },
      resolvedAt: { type: Date, default: null },
      resolvedBy: {
        id: { type: String, default: null },
        name: { type: String, default: null },
        role: { type: String, default: null },
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
