const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth, redirectIfLoggedIn } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', redirectIfLoggedIn, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', redirectIfLoggedIn, authController.login);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', requireAuth, authController.logout);

/**
 * @route   GET /api/auth/verify/:id
 * @desc    Verify email
 * @access  Public
 */
router.get('/verify/:id', authController.verifyEmail);

/**
 * @route   GET /api/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', requireAuth, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', requireAuth, upload.single('photo'), authController.updateProfile);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password', redirectIfLoggedIn, authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password/:id/:token
 * @desc    Reset password
 * @access  Public
 */
router.post('/reset-password/:id/:token', authController.resetPassword);

/**
 * @route   POST /api/auth/onboarding
 * @desc    Complete user onboarding
 * @access  Private
 */
router.post('/onboarding', requireAuth, authController.completeOnboarding);

module.exports = router; 