import { body } from 'express-validator';

export const createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least 1 item'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required for each item'),
  body('items.*.variantId').notEmpty().withMessage('Variant ID is required for each item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
  
  body('address').isObject().withMessage('Delivery address is required'),
  body('address.customerName').notEmpty().withMessage('Customer name is required'),
  body('address.phone').isMobilePhone('en-IN').withMessage('Valid Indian phone number is required'),
  body('address.addressLine1').notEmpty().withMessage('Address Line 1 is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.pincode').isPostalCode('IN').withMessage('Valid Indian pincode is required'),
  body('address.latitude').isNumeric().withMessage('Valid latitude is required'),
  body('address.longitude').isNumeric().withMessage('Valid longitude is required'),
];
