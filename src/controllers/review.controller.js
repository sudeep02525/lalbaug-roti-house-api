import Review from '../models/Review.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// @desc    Create a new review
// @route   POST /api/v1/reviews
// @access  Public
export const createReview = async (req, res, next) => {
  try {
    const { name, rating, comment, productId } = req.body;

    const review = await Review.create({
      productId,
      name,
      rating,
      comment
    });

    // Only update Product if the productId is a valid MongoDB ObjectId (skip mock IDs like m1, m2)
    if (productId && productId.match(/^[0-9a-fA-F]{24}$/)) {
      const reviews = await Review.find({ productId, isApproved: true });
      const numReviews = reviews.length;
      const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / (numReviews || 1);

      await Product.findByIdAndUpdate(productId, {
        rating: Number(avgRating.toFixed(1)),
        numReviews
      });
    }

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all approved reviews
// @route   GET /api/v1/reviews
// @access  Public
export const getReviews = async (req, res, next) => {
  try {
    let query = { isApproved: true };
    if (req.query.productId) {
      if (req.query.productId.match(/^[0-9a-fA-F]{24}$/)) {
        // Match both string and ObjectId representations for backward compatibility
        query.productId = { $in: [req.query.productId, new mongoose.Types.ObjectId(req.query.productId)] };
      } else {
        query.productId = req.query.productId;
      }
    } else if (req.query.global) {
      query.productId = { $exists: false };
    }
    
    const reviews = await Review.find(query).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};
