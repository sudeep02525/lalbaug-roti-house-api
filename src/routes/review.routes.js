import express from 'express';
import { createReview, getReviews } from '../controllers/review.controller.js';

const router = express.Router();

router.route('/')
  .post(createReview)
  .get(getReviews);

export default router;
