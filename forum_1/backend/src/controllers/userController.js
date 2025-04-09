import User from '../models/User.js';
import Post from '../models/Post.js';
import mongoose from 'mongoose';

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
  try {
    console.log('Fetching user with ID:', req.params.id);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error('Invalid user ID format:', req.params.id);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    const userId = new mongoose.Types.ObjectId(req.params.id);
    console.log('Converted ObjectId:', userId.toString());
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      console.error('User not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Found user:', user.username, 'with ID:', user._id.toString());
    
    // Send the response with the standard format
    const response = {
      success: true,
      data: user
    };
    
    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Get user's comments
// @route   GET /api/comments/user/:userId
// @access  Public
export const getUserComments = async (req, res) => {
  try {
    console.log('Fetching comments for user ID:', req.params.userId);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    // Convert string ID to ObjectId
    const userId = new mongoose.Types.ObjectId(req.params.userId);
    
    // Find all posts that have comments by this user
    const posts = await Post.find({
      'comments.userId': userId
    }).populate('userId', 'username avatar')
      .populate('categoryId', 'name slug');
    
    // Extract all comments by this user from all posts
    let userComments = [];
    
    posts.forEach(post => {
      const postComments = post.comments.filter(
        comment => {
          // Handle both string IDs and ObjectIds by converting both to strings
          const commentUserId = comment.userId && comment.userId.toString ? 
            comment.userId.toString() : 
            comment.userId;
          
          return commentUserId === req.params.userId;
        }
      );
      
      // Add post information to each comment
      const commentsWithPostInfo = postComments.map(comment => ({
        ...comment.toObject(),
        postId: post._id,
        postTitle: post.title
      }));
      
      userComments = [...userComments, ...commentsWithPostInfo];
    });
    
    // Sort comments by date (newest first)
    userComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log(`Found ${userComments.length} comments for user ${req.params.userId}`);

    res.json({
      success: true,
      data: userComments
    });
  } catch (error) {
    console.error('Error getting user comments:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req, res) => {
  try {
    console.log('Updating user with ID:', req.params.id);
    console.log('Update data:', req.body);
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      console.error('Invalid user ID format:', req.params.id);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    const userId = new mongoose.Types.ObjectId(req.params.id);
    
    // Only allow updating certain fields
    const allowedUpdates = {
      username: req.body.username,
      email: req.body.email,
      avatar: req.body.avatar
    };

    // Remove undefined fields
    Object.keys(allowedUpdates).forEach(key => 
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      console.error('User not found for ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Updated user:', user.username, 'with ID:', user._id.toString());
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};