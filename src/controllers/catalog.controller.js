import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Variant from '../models/Variant.js';
import Addon from '../models/Addon.js';
import Settings from '../models/Settings.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';
import fs from 'fs';
import path from 'path';
import { deleteFromCloudinary } from '../config/cloudinary.js';

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
    
    // Sort products so that out-of-stock items appear at the bottom
    categoryProducts.sort((a, b) => {
      const aStock = a.inStock !== false; // true or undefined is inStock
      const bStock = b.inStock !== false;
      if (aStock === bStock) return 0;
      return aStock ? -1 : 1;
    });
    
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
        isDailyCombo: product.isDailyCombo,
        inStock: product.inStock
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
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
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
  const { id } = req.params;

  // Intercept Mumbai Special items (e.g., m1, m5)
  if (id && id.startsWith('m') && id.length <= 3) {
    const settings = await Settings.findOne();
    if (settings && settings.mumbaiSpecials) {
      const special = settings.mumbaiSpecials.find(s => s.id === id);
      if (special) {
        const mockProduct = {
          _id: special.id,
          id: special.id,
          name: special.name,
          description: special.description,
          images: [special.image],
          isVeg: special.isVeg,
          active: true,
          categoryId: { name: 'Mumbai Specials' },
          addons: [],
          badges: ["100% Pure Veg", "Served Fresh", "Traditional Recipe", "Bestseller"],
          variants: [
            special.price ? { _id: special.id + '_v', price: special.price, minQuantity: 1, active: true } : null,
            special.packPrice ? { _id: special.id + '_vp', price: special.packPrice, minQuantity: special.packSize || special.packQty || 1, active: true } : null
          ].filter(Boolean)
        };
        return new ApiResponse(res).success(mockProduct);
      }
    }
  }

  // Handle standard MongoDB ObjectIds
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    throw new Error('Product not found');
  }

  const product = await Product.findById(id).populate('categoryId', 'name').populate('addons');
  if (!product) throw new Error('Product not found');
  
  // Get variants for this product
  const variants = await Variant.find({ productId: product._id, active: true });
  
  return new ApiResponse(res).success({ ...product._doc, variants });
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, details, images, active, categoryId, isBestseller, isDailyCombo, addons, inStock } = req.body;
  const product = await Product.create({ name, description, details, images, active, categoryId, isBestseller, isDailyCombo, addons, inStock });
  return new ApiResponse(res).success(product, 'Product created', 201);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, details, images, active, categoryId, isBestseller, isDailyCombo, addons, inStock } = req.body;
  
  const existingProduct = await Product.findById(req.params.id);
  if (!existingProduct) throw new Error('Product not found');

  // If new images array is provided, check if old images were removed and delete them
  if (images && existingProduct.images) {
    const oldImages = existingProduct.images;
    const removedImages = oldImages.filter(img => !images.includes(img));
    
    for (const imageUrl of removedImages) {
      if (imageUrl && imageUrl.includes('cloudinary.com')) {
        await deleteFromCloudinary(imageUrl, 'image');
      }
    }
  }

  const product = await Product.findByIdAndUpdate(req.params.id, { name, description, details, images, active, categoryId, isBestseller, isDailyCombo, addons, inStock }, { returnDocument: 'after', runValidators: true });
  return new ApiResponse(res).success(product, 'Product updated');
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new Error('Product not found');

  // Clean up associated images from Cloudinary
  if (product.images && product.images.length > 0) {
    for (const imageUrl of product.images) {
      if (imageUrl && imageUrl.includes('cloudinary.com')) {
        await deleteFromCloudinary(imageUrl, 'image');
      }
    }
  }

  return new ApiResponse(res).success({}, 'Product deleted');
});

export const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new Error('Please upload an image file');
  }

  // Cloudinary returns the full URL in req.file.path
  const imageUrl = req.file.path;
  return new ApiResponse(res).success({ imageUrl }, 'Product image uploaded successfully');
});

export const uploadBannerImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new Error('Please upload an image file');
  }

  // Cloudinary returns the full URL in req.file.path
  const imageUrl = req.file.path;
  return new ApiResponse(res).success({ imageUrl }, 'Banner image uploaded successfully');
});

// ==============================
// VARIANT
// ==============================
export const createVariant = asyncHandler(async (req, res) => {
  const variant = await Variant.create(req.body);
  return new ApiResponse(res).success(variant, 'Variant created', 201);
});

export const updateVariant = asyncHandler(async (req, res) => {
  const variant = await Variant.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
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
  const existingAddon = await Addon.findById(req.params.id);
  if (!existingAddon) throw new Error('Addon not found');

  // Delete old image from Cloudinary if it was changed or removed
  if (req.body.image !== undefined && existingAddon.image && existingAddon.image !== req.body.image) {
    if (existingAddon.image.includes('cloudinary.com')) {
      await deleteFromCloudinary(existingAddon.image, 'image');
    }
  }

  const addon = await Addon.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
  return new ApiResponse(res).success(addon, 'Addon updated');
});

export const deleteAddon = asyncHandler(async (req, res) => {
  const addon = await Addon.findByIdAndDelete(req.params.id);
  if (!addon) throw new Error('Addon not found');

  if (addon.image && addon.image.includes('cloudinary.com')) {
    await deleteFromCloudinary(addon.image, 'image');
  }

  return new ApiResponse(res).success({}, 'Addon deleted');
});
