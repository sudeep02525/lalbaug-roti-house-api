import Review from '../models/Review.js';

// @desc    Create a new review
// @route   POST /api/v1/reviews
// @access  Public
export const createReview = async (req, res, next) => {
  try {
    const { name, rating, comment } = req.body;

    const review = await Review.create({
      name,
      rating,
      comment
    });

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
    const reviews = await Review.find({ isApproved: true }).sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};
