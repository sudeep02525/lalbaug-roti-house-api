import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import asyncHandler from '../utils/asyncHandler.js';
import Admin from '../models/Admin.js';
import CmsAdmin from '../models/CmsAdmin.js';
import DeliveryBoy from '../models/DeliveryBoy.js';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  


  if (!token) {
    res.status(401);
    throw new Error('Not authorized to access this route');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check which model the user belongs to based on the role stored in token
    if (decoded.role === 'ADMIN') {
      req.user = await Admin.findById(decoded.id);
    } else if (decoded.role === 'CMS_ADMIN') {
      req.user = await CmsAdmin.findById(decoded.id);
    } else if (decoded.role === 'DELIVERY_BOY') {
      req.user = await DeliveryBoy.findById(decoded.id);
    } else if (decoded.role === 'USER') {
      req.user = await User.findById(decoded.id);
    }

    if (!req.user) {
      res.status(401);
      throw new Error('User no longer exists. Please log in again.');
    }

    next();
  } catch (error) {

    res.status(401);
    throw new Error(`Auth Error: ${error.message}`);
  }
});
