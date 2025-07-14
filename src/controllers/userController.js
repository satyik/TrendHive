const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * @desc    Search users
 * @route   GET /api/users/search
 * @access  Private
 */
const searchUsers = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const query = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } }
      ],
      active: true
    };

    const users = await User.find(query)
      .select('name email username profilePic')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    next(new AppError('Failed to search users', 500));
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id)
      .select('-password -passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    next(new AppError('Failed to fetch user', 500));
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove sensitive fields from update data
    delete updateData.password;
    delete updateData.passwordResetToken;
    delete updateData.passwordResetExpires;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -passwordResetToken -passwordResetExpires');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    next(new AppError('Failed to update user', 500));
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    next(new AppError('Failed to delete user', 500));
  }
};

/**
 * @desc    Upload profile photo
 * @route   POST /api/users/upload-photo
 * @access  Private
 */
const uploadPhoto = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload a photo'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePic: req.file.path },
      { new: true }
    ).select('-password -passwordResetToken -passwordResetExpires');

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profilePic: user.profilePic
        }
      }
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    next(new AppError('Failed to upload photo', 500));
  }
};

/**
 * @desc    Download user data as PDF
 * @route   GET /api/users/download/:type/pdf
 * @access  Private
 */
const downloadData = async (req, res, next) => {
  try {
    const { type } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // This is a placeholder for PDF generation
    // In a real implementation, you would use a library like PDFKit
    const userData = {
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      createdAt: user.createdAt,
      type: type
    };

    res.json({
      success: true,
      message: 'Data download initiated',
      data: {
        userData,
        downloadUrl: `/api/users/download/${type}/pdf` // Placeholder
      }
    });
  } catch (error) {
    console.error('Download data error:', error);
    next(new AppError('Failed to download data', 500));
  }
};

module.exports = {
  searchUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadPhoto,
  downloadData
}; 