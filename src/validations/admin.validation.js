import { body } from 'express-validator';

export const adminLoginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Please provide a password')
];
