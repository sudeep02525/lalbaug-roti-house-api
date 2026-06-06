import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Admin from '../src/models/Admin.js';
import bcrypt from 'bcrypt';

const updateAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const email = 'lalbaugrotihouse@gmail.com';
    const password = 'lalbaugrotihouse';

    let admin = await Admin.findOne();
    
    if (admin) {
      admin.email = email;
      admin.password = password; // The pre-save hook in Admin model will hash it
      await admin.save();
      console.log('Admin updated successfully:', email);
    } else {
      await Admin.create({
        name: 'Admin User',
        email: email,
        password: password
      });
      console.log('Admin created successfully:', email);
    }

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

updateAdmin();
