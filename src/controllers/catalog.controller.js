import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import Addon from '../models/Addon.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';

// ==============================
// MENU (Formatted for Frontend)
// ==============================
export const getMenu = asyncHandler(async (req, res) => {
  const categories = await Category.find({ active: true }).sort({ createdAt: 1 });
  const products = await Product.find({ active: true }).populate('addons');
  const variants = await Variant.find({ active: true });

  const menuData = {};

  for (const category of categories) {
    const categoryProducts = products.filter(p => p.categoryId.toString() === category._id.toString());
    
    menuData[category.name] = categoryProducts.map(product => {
      const productVariants = variants.filter(v => v.productId.toString() === product._id.toString());
      
      const singleVariant = productVariants.find(v => v.minQuantity === 1);
      const packVariant = productVariants.find(v => v.minQuantity > 1);

      return {
        id: product._id.toString(),
        name: product.name,
        desc: product.description || "",
        image: product.images?.[0] || "",
        price: singleVariant ? singleVariant.price : null,
        singleVariantId: singleVariant ? singleVariant._id.toString() : null,
        packPrice: packVariant ? packVariant.price : null,
        packQty: packVariant ? packVariant.minQuantity : null,
        packVariantId: packVariant ? packVariant._id.toString() : null,
        addons: product.addons,
        isBestseller: product.isBestseller,
        isDailyCombo: product.isDailyCombo
      };
    });
  }

  return new ApiResponse(res).success(menuData);
});

// ==============================
// CATEGORY
// ==============================
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  return new ApiResponse(res).success(categories);
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  return new ApiResponse(res).success(category, 'Category created', 201);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) throw new Error('Category not found');
  return new ApiResponse(res).success(category, 'Category updated');
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new Error('Category not found');
  return new ApiResponse(res).success({}, 'Category deleted');
});

// ==============================
// PRODUCT
// ==============================
export const getProducts = asyncHandler(async (req, res) => {
  let query = {};
  if (req.query.categoryId) {
    query.categoryId = req.query.categoryId;
  }
  const products = await Product.find(query).populate('categoryId', 'name').populate('addons');
  return new ApiResponse(res).success(products);
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('categoryId', 'name').populate('addons');
  if (!product) throw new Error('Product not found');
  
  // Get variants for this product
  const variants = await Variant.find({ productId: product._id, active: true });
  
  return new ApiResponse(res).success({ ...product._doc, variants });
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, images, active, categoryId, isBestseller, isDailyCombo } = req.body;
  const product = await Product.create({ name, description, images, active, categoryId, isBestseller, isDailyCombo });
  return new ApiResponse(res).success(product, 'Product created', 201);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, images, active, categoryId, isBestseller, isDailyCombo } = req.body;
  const product = await Product.findByIdAndUpdate(req.params.id, { name, description, images, active, categoryId, isBestseller, isDailyCombo }, { new: true, runValidators: true });
  if (!product) throw new Error('Product not found');
  return new ApiResponse(res).success(product, 'Product updated');
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new Error('Product not found');
  return new ApiResponse(res).success({}, 'Product deleted');
});

// ==============================
// VARIANT
// ==============================
export const createVariant = asyncHandler(async (req, res) => {
  const variant = await Variant.create(req.body);
  return new ApiResponse(res).success(variant, 'Variant created', 201);
});

export const updateVariant = asyncHandler(async (req, res) => {
  const variant = await Variant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!variant) throw new Error('Variant not found');
  return new ApiResponse(res).success(variant, 'Variant updated');
});

export const deleteVariant = asyncHandler(async (req, res) => {
  const variant = await Variant.findByIdAndDelete(req.params.id);
  if (!variant) throw new Error('Variant not found');
  return new ApiResponse(res).success({}, 'Variant deleted');
});

// ==============================
// ADDON
// ==============================
export const getAddons = asyncHandler(async (req, res) => {
  const addons = await Addon.find();
  return new ApiResponse(res).success(addons);
});

export const createAddon = asyncHandler(async (req, res) => {
  const addon = await Addon.create(req.body);
  return new ApiResponse(res).success(addon, 'Addon created', 201);
});

export const updateAddon = asyncHandler(async (req, res) => {
  const addon = await Addon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!addon) throw new Error('Addon not found');
  return new ApiResponse(res).success(addon, 'Addon updated');
});

export const deleteAddon = asyncHandler(async (req, res) => {
  const addon = await Addon.findByIdAndDelete(req.params.id);
  if (!addon) throw new Error('Addon not found');
  return new ApiResponse(res).success({}, 'Addon deleted');
});
