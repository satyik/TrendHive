const Group = require('../models/Group');
const User = require('../models/User');
const Post = require('../models/Post');

/**
 * @desc    Get all groups
 * @route   GET /api/groups
 * @access  Private
 */
const getAllGroups = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const groups = await Group.find(query)
      .populate('creator', 'name profilePic')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Group.countDocuments(query);

    res.json({
      success: true,
      data: {
        groups,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalGroups: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch groups'
    });
  }
};

/**
 * @desc    Get group by ID
 * @route   GET /api/groups/:id
 * @access  Private
 */
const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const group = await Group.findById(id)
      .populate('creator', 'name profilePic')
      .populate('members', 'name profilePic');

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    res.json({
      success: true,
      data: {
        group
      }
    });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch group'
    });
  }
};

/**
 * @desc    Create new group
 * @route   POST /api/groups
 * @access  Private
 */
const createGroup = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const userId = req.user._id;

    // Check if group name already exists
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({
        success: false,
        error: 'Group name already exists'
      });
    }

    const groupData = {
      name,
      description,
      category,
      creator: userId,
      members: [userId],
      photo: req.file ? req.file.path : null
    };

    const group = await Group.create(groupData);

    // Add group to user's groups
    await User.findByIdAndUpdate(userId, {
      $push: { group: group._id }
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('creator', 'name profilePic')
      .populate('members', 'name profilePic');

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: {
        group: populatedGroup
      }
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create group'
    });
  }
};

/**
 * @desc    Update group
 * @route   PUT /api/groups/:id
 * @access  Private
 */
const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is the creator
    if (group.creator.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Only group creator can update the group'
      });
    }

    if (req.file) {
      updateData.photo = req.file.path;
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('creator', 'name profilePic')
     .populate('members', 'name profilePic');

    res.json({
      success: true,
      message: 'Group updated successfully',
      data: {
        group: updatedGroup
      }
    });
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update group'
    });
  }
};

/**
 * @desc    Delete group
 * @route   DELETE /api/groups/:id
 * @access  Private
 */
const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is the creator
    if (group.creator.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Only group creator can delete the group'
      });
    }

    // Remove group from all members
    await User.updateMany(
      { group: id },
      { $pull: { group: id } }
    );

    // Delete all posts in the group
    await Post.deleteMany({ group: id });

    // Delete the group
    await Group.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Group deleted successfully'
    });
  } catch (error) {
    console.error('Delete group error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete group'
    });
  }
};

/**
 * @desc    Join group
 * @route   POST /api/groups/:id/join
 * @access  Private
 */
const joinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: 'You are already a member of this group'
      });
    }

    // Add user to group members
    await Group.findByIdAndUpdate(id, {
      $push: { members: userId }
    });

    // Add group to user's groups
    await User.findByIdAndUpdate(userId, {
      $push: { group: id }
    });

    res.json({
      success: true,
      message: 'Successfully joined the group'
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join group'
    });
  }
};

/**
 * @desc    Leave group
 * @route   POST /api/groups/:id/leave
 * @access  Private
 */
const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is the creator
    if (group.creator.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Group creator cannot leave the group. Transfer ownership or delete the group.'
      });
    }

    // Check if user is a member
    if (!group.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        error: 'You are not a member of this group'
      });
    }

    // Remove user from group members
    await Group.findByIdAndUpdate(id, {
      $pull: { members: userId }
    });

    // Remove group from user's groups
    await User.findByIdAndUpdate(userId, {
      $pull: { group: id }
    });

    res.json({
      success: true,
      message: 'Successfully left the group'
    });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to leave group'
    });
  }
};

/**
 * @desc    Get group feed
 * @route   GET /api/groups/:id/feed
 * @access  Private
 */
const getGroupFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    // Check if user is a member
    if (!group.members.includes(userId)) {
      return res.status(403).json({
        success: false,
        error: 'You must be a member to view group feed'
      });
    }

    const posts = await Post.find({ group: id })
      .populate('author', 'name profilePic')
      .populate('likes', 'name profilePic')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Post.countDocuments({ group: id });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get group feed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch group feed'
    });
  }
};

module.exports = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  getGroupFeed
}; 