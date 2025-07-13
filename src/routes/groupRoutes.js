const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { requireAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

/**
 * @route   GET /api/groups
 * @desc    Get all groups
 * @access  Private
 */
router.get('/', requireAuth, groupController.getAllGroups);

/**
 * @route   GET /api/groups/:id
 * @desc    Get group by ID
 * @access  Private
 */
router.get('/:id', requireAuth, groupController.getGroupById);

/**
 * @route   POST /api/groups
 * @desc    Create new group
 * @access  Private
 */
router.post('/', requireAuth, upload.single('photo'), groupController.createGroup);

/**
 * @route   PUT /api/groups/:id
 * @desc    Update group
 * @access  Private
 */
router.put('/:id', requireAuth, upload.single('photo'), groupController.updateGroup);

/**
 * @route   DELETE /api/groups/:id
 * @desc    Delete group
 * @access  Private
 */
router.delete('/:id', requireAuth, groupController.deleteGroup);

/**
 * @route   POST /api/groups/:id/join
 * @desc    Join group
 * @access  Private
 */
router.post('/:id/join', requireAuth, groupController.joinGroup);

/**
 * @route   POST /api/groups/:id/leave
 * @desc    Leave group
 * @access  Private
 */
router.post('/:id/leave', requireAuth, groupController.leaveGroup);

/**
 * @route   GET /api/groups/:id/feed
 * @desc    Get group feed
 * @access  Private
 */
router.get('/:id/feed', requireAuth, groupController.getGroupFeed);

module.exports = router; 