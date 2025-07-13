const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

/**
 * @route   GET /api/users/search
 * @desc    Search users
 * @access  Private
 */
router.get('/search', requireAuth, userController.searchUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', requireAuth, userController.getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private
 */
router.put('/:id', requireAuth, userController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private
 */
router.delete('/:id', requireAuth, userController.deleteUser);

/**
 * @route   POST /api/users/upload-photo
 * @desc    Upload profile photo
 * @access  Private
 */
router.post('/upload-photo', requireAuth, upload.single('photo'), userController.uploadPhoto);

/**
 * @route   GET /api/users/download/:type/pdf
 * @desc    Download user data as PDF
 * @access  Private
 */
router.get('/download/:type/pdf', requireAuth, userController.downloadData);

module.exports = router; 