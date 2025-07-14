const Post = require('../models/Post');
const User = require('../models/User');
const Group = require('../models/Group');
const AppError = require('../utils/AppError');

/**
 * @desc    Get all posts
 * @route   GET /api/posts
 * @access  Private
 */
const getAllPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, author, group } = req.query;
    
    const query = {};
    if (author) {
      query.author = author;
    }
    if (group) {
      query.group = group;
    }

    const posts = await Post.find(query)
      .populate('author', 'name profilePic')
      .populate('group', 'name')
      .populate('likes', 'name profilePic')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Post.countDocuments(query);

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
    console.error('Get posts error:', error);
    next(new AppError('Failed to fetch posts', 500));
  }
};

/**
 * @desc    Get post by ID
 * @route   GET /api/posts/:id
 * @access  Private
 */
const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id)
      .populate('author', 'name profilePic')
      .populate('group', 'name')
      .populate('likes', 'name profilePic')
      .populate('comments.author', 'name profilePic');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    res.json({
      success: true,
      data: {
        post
      }
    });
  } catch (error) {
    console.error('Get post error:', error);
    next(new AppError('Failed to fetch post', 500));
  }
};

/**
 * @desc    Create new post
 * @route   POST /api/posts
 * @access  Private
 */
const createPost = async (req, res, next) => {
  try {
    const { content, groupId } = req.body;
    const userId = req.user._id;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Post content is required'
      });
    }

    const postData = {
      content,
      author: userId,
      photo: req.file ? req.file.path : null
    };

    // If groupId is provided, verify user is a member
    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          error: 'Group not found'
        });
      }

      if (!group.members.includes(userId)) {
        return res.status(403).json({
          success: false,
          error: 'You must be a member to post in this group'
        });
      }

      postData.group = groupId;
    }

    const post = await Post.create(postData);

    // Add post to user's posts
    await User.findByIdAndUpdate(userId, {
      $push: { post: post._id }
    });

    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name profilePic')
      .populate('group', 'name');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        post: populatedPost
      }
    });
  } catch (error) {
    console.error('Create post error:', error);
    next(new AppError('Failed to create post', 500));
  }
};

/**
 * @desc    Update post
 * @route   PUT /api/posts/:id
 * @access  Private
 */
const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Only post author can update the post'
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { content },
      { new: true, runValidators: true }
    ).populate('author', 'name profilePic')
     .populate('group', 'name')
     .populate('likes', 'name profilePic');

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: {
        post: updatedPost
      }
    });
  } catch (error) {
    console.error('Update post error:', error);
    next(new AppError('Failed to update post', 500));
  }
};

/**
 * @desc    Delete post
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check if user is the author
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Only post author can delete the post'
      });
    }

    // Remove post from user's posts
    await User.findByIdAndUpdate(userId, {
      $pull: { post: id }
    });

    await Post.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    next(new AppError('Failed to delete post', 500));
  }
};

/**
 * @desc    Toggle like on post
 * @route   POST /api/posts/:id/like
 * @access  Private
 */
const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike
      await Post.findByIdAndUpdate(id, {
        $pull: { likes: userId }
      });
    } else {
      // Like
      await Post.findByIdAndUpdate(id, {
        $push: { likes: userId }
      });
    }

    const updatedPost = await Post.findById(id)
      .populate('author', 'name profilePic')
      .populate('likes', 'name profilePic');

    res.json({
      success: true,
      message: isLiked ? 'Post unliked' : 'Post liked',
      data: {
        post: updatedPost
      }
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    next(new AppError('Failed to toggle like', 500));
  }
};

/**
 * @desc    Add comment to post
 * @route   POST /api/posts/:id/comment
 * @access  Private
 */
const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required'
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const comment = {
      content,
      author: userId,
      createdAt: new Date()
    };

    await Post.findByIdAndUpdate(id, {
      $push: { comments: comment }
    });

    const updatedPost = await Post.findById(id)
      .populate('author', 'name profilePic')
      .populate('comments.author', 'name profilePic');

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: {
        post: updatedPost
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    next(new AppError('Failed to add comment', 500));
  }
};

/**
 * @desc    Delete comment
 * @route   DELETE /api/posts/:postId/comment/:commentId
 * @access  Private
 */
const deleteComment = async (req, res, next) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Check if user is the comment author
    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Only comment author can delete the comment'
      });
    }

    await Post.findByIdAndUpdate(postId, {
      $pull: { comments: { _id: commentId } }
    });

    const updatedPost = await Post.findById(postId)
      .populate('author', 'name profilePic')
      .populate('comments.author', 'name profilePic');

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      data: {
        post: updatedPost
      }
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    next(new AppError('Failed to delete comment', 500));
  }
};

/**
 * @desc    Get user feed
 * @route   GET /api/posts/feed
 * @access  Private
 */
const getUserFeed = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    // Get user's groups
    const user = await User.findById(userId).populate('group');
    const userGroups = user.group.map(g => g._id);

    // Get posts from user's groups and user's own posts
    const query = {
      $or: [
        { author: userId },
        { group: { $in: userGroups } }
      ]
    };

    const posts = await Post.find(query)
      .populate('author', 'name profilePic')
      .populate('group', 'name')
      .populate('likes', 'name profilePic')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Post.countDocuments(query);

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
    console.error('Get user feed error:', error);
    next(new AppError('Failed to fetch user feed', 500));
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  getUserFeed
}; 