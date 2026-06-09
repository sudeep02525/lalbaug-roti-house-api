import Settings from '../models/Settings.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/apiResponse.js';

// @desc    Get settings (creates default if not exists)
// @route   GET /api/v1/settings
// @access  Public
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return new ApiResponse(res).success(settings);
});

// @desc    Update settings
// @route   PUT /api/v1/settings
// @access  Private/Admin
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(req.body);
  } else {
    settings = await Settings.findByIdAndUpdate(settings._id, req.body, { new: true });
  }
  return new ApiResponse(res).success(settings, 'Settings updated successfully');
});
