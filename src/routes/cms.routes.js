import express from 'express';
import {
  loginCms, forgotPassword, resetPassword, updateCmsProfile, updateCmsPassword,
  getCmsAdmins, createCmsAdmin, updateCmsAdmin, deleteCmsAdmin
} from '../controllers/cms.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { Roles } from '../constants/index.js';

const router = express.Router();

const cmsOnly = [protect, authorize(Roles.ADMIN, Roles.CMS_ADMIN)];

// CMS Auth Controls
router.post('/login', loginCms);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// CMS Profile Controls
router.put('/profile', cmsOnly, updateCmsProfile);
router.put('/password', cmsOnly, updateCmsPassword);

// CMS Management Controls (Super Admin Only)
const superAdminOnly = [protect, authorize(Roles.ADMIN)];
router.route('/manage')
  .get(superAdminOnly, getCmsAdmins)
  .post(superAdminOnly, createCmsAdmin);
  
router.route('/manage/:id')
  .put(superAdminOnly, updateCmsAdmin)
  .delete(superAdminOnly, deleteCmsAdmin);

export default router;
