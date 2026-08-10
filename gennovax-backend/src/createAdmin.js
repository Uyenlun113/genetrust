import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.model.js';

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecting to DB...');

    const email = 'admin@gennovax.com';
    const password = 'admin';
    const passwordHash = await bcrypt.hash(password, 10);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      existingUser.passwordHash = passwordHash;
      existingUser.role = 'super_admin';
      existingUser.isActive = true;
      await existingUser.save();
      console.log('✅ Updated existing admin account!');
    } else {
      await User.create({
        name: 'Admin GennovaX',
        email: email,
        passwordHash: passwordHash,
        role: 'super_admin',
        isActive: true,
      });
      console.log('✅ Created super_admin user!');
    }

    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();
