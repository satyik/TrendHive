const express = require('express');
const router = express.Router();

const authController = require('../controllers/authControllers');
const { requireAuth, redirectIfLoggedIn } = require('../middleware/userAuthMiddleware');
const upload = require('../middleware/uploadMiddleware');

// -------------------------
// Auth Routes
// -------------------------
router.get('/verify/:id', authController.emailVerify_get);
router.get('/signup', redirectIfLoggedIn, authController.signup_get);
router.post('/signup', authController.signup_post);
router.get('/login', redirectIfLoggedIn, authController.login_get);
router.post('/login', authController.login_post);
router.get('/logout', requireAuth, authController.logout_get);
router.get('/profile', requireAuth, authController.profile_get);

// -------------------------
// Group Features
// -------------------------
router.get('/createGroup', requireAuth, authController.createGroup_get);
router.post('/createGroup', requireAuth, upload.single('photo'), authController.createGroup_post);

router.get('/groupFeed', requireAuth, authController.groupFeed_get);
router.get('/groupLanding', requireAuth, authController.groupLanding_get);
router.get('/joinGroup/:id', requireAuth, authController.joinGroup_get);
router.get('/homeGroup', requireAuth, authController.homeGroup_get);
router.get('/homegroupPage/:name', requireAuth, authController.homegroupPage);
router.post('/groupEdit/:id', requireAuth, authController.groupEdit);

// -------------------------
// Posts in Groups
// -------------------------
router.post('/postinGroup/:id', requireAuth, upload.single('photo'), authController.postinGroup_post);
router.post('/updatepost/:id', requireAuth, authController.updatePost_post);

// -------------------------
// Comments & Likes
// -------------------------
router.get('/likePost/:id/:gid', requireAuth, authController.likePost);
router.get('/like/:id', requireAuth, authController.like);
router.get('/likeProfile/:id', requireAuth, authController.like_profile);

router.post('/comment/:id', requireAuth, authController.comment_profile);
router.post('/commentGroup/:id', requireAuth, authController.comment_homeGroup);
router.post('/commentHome/:id/:gid', requireAuth, authController.comment_home);

// -------------------------
// Search & Onboarding
// -------------------------
router.post('/search', requireAuth, authController.search_post);
router.post('/onboarding', requireAuth, authController.onboarding_post);

// -------------------------
// Password Reset
// -------------------------
router.get('/forgotPassword', redirectIfLoggedIn, authController.getForgotPasswordForm);
router.post('/forgotPassword', redirectIfLoggedIn, authController.forgotPassword);
router.get('/resetPassword/:id/:token', authController.getPasswordResetForm);
router.post('/resetPassword/:id/:token', authController.resetPassword);

// -------------------------
// Profile Pic Upload
// -------------------------
router.post(
  '/profile/picupload',
  requireAuth,
  upload.single('photo'),
  authController.picupload_post
);

// -------------------------
// File Download
// -------------------------
router.get('/download/:type/pdf', requireAuth, authController.download);

module.exports = router;
