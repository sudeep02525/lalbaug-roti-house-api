import express from 'express';
import {
  getMenu,
  getCategories, createCategory, updateCategory, deleteCategory,
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, uploadProductImage,
  createVariant, updateVariant, deleteVariant,
  getAddons, createAddon, updateAddon, deleteAddon
} from '../controllers/catalog.controller.js';
import uploadImage from '../middleware/imageUpload.middleware.js';
import { protect } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/role.middleware.js';
import { Roles } from '../constants/index.js';

const router = express.Router();

// Admin and CMS only middleware for mutations
const adminOnly = [protect, authorize(Roles.ADMIN, Roles.CMS_ADMIN)];

// Menu Endpoint (Formatted for Frontend)
router.route('/menu').get(getMenu);

// Categories
router.route('/categories')
  .get(getCategories)
  .post(adminOnly, createCategory);
router.route('/categories/:id')
  .put(adminOnly, updateCategory)
  .delete(adminOnly, deleteCategory);

// Products
router.route('/products')
  .get(getProducts)
  .post(adminOnly, createProduct);

router.route('/products/upload')
  .post(adminOnly, uploadImage.single('image'), uploadProductImage);
router.route('/products/:id')
  .get(getProduct)
  .put(adminOnly, updateProduct)
  .delete(adminOnly, deleteProduct);

// Variants
router.route('/variants')
  .post(adminOnly, createVariant);
router.route('/variants/:id')
  .put(adminOnly, updateVariant)
  .delete(adminOnly, deleteVariant);

// Addons
router.route('/addons')
  .get(getAddons)
  .post(adminOnly, createAddon);
router.route('/addons/:id')
  .put(adminOnly, updateAddon)
  .delete(adminOnly, deleteAddon);

export default router;
