const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { requireAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

/**
 * @route   GET /api/posts
 * @desc    Get all posts
 * @access  Private
 */
router.get('/', requireAuth, postController.getAllPosts);

/**
 * @route   GET /api/posts/:id
 * @desc    Get post by ID
 * @access  Private
 */
router.get('/:id', requireAuth, postController.getPostById);

/**
 * @route   POST /api/posts
 * @desc    Create new post
 * @access  Private
 */
router.post('/', requireAuth, upload.single('photo'), postController.createPost);

/**
 * @route   PUT /api/posts/:id
 * @desc    Update post
 * @access  Private
 */
router.put('/:id', requireAuth, postController.updatePost);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete post
 * @access  Private
 */
router.delete('/:id', requireAuth, postController.deletePost);

/**
 * @route   POST /api/posts/:id/like
 * @desc    Like/unlike post
 * @access  Private
 */
router.post('/:id/like', requireAuth, postController.toggleLike);

/**
 * @route   POST /api/posts/:id/comment
 * @desc    Add comment to post
 * @access  Private
 */
router.post('/:id/comment', requireAuth, postController.addComment);

/**
 * @route   DELETE /api/posts/:postId/comment/:commentId
 * @desc    Delete comment
 * @access  Private
 */
router.delete('/:postId/comment/:commentId', requireAuth, postController.deleteComment);

/**
 * @route   GET /api/posts/feed
 * @desc    Get user feed
 * @access  Private
 */
router.get('/feed', requireAuth, postController.getUserFeed);

module.exports = router; 