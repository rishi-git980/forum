const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, content, category, tags, image } = req.body;
  
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    const newPost = new Post({
      title,
      content,
      category,
      author: req.user.id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      image,
    });
    
    const post = await newPost.save();
    
    // Add post to user's posts array
    user.posts.push(post._id);
    await user.save();
    
    // Populate author details
    await post.populate('author', 'username avatar');
    
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ date: -1 })
      .populate('author', 'username avatar')
      .limit(10);
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/posts/:id
// @desc    Get post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username avatar',
        },
        options: { sort: { date: -1 } },
      });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json(post);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/posts/category/:category
// @desc    Get posts by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const posts = await Post.find({ category: req.params.category })
      .sort({ date: -1 })
      .populate('author', 'username avatar')
      .limit(10);
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/posts/user/:userId
// @desc    Get posts by user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .sort({ date: -1 })
      .populate('author', 'username avatar');
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/posts/:id/comments
// @desc    Add comment to post
// @access  Private
router.post('/:id/comments', auth, async (req, res) => {
  const { text, parentComment } = req.body;
  
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const user = await User.findById(req.user.id).select('-password');
    
    const newComment = new Comment({
      text,
      author: req.user.id,
      post: req.params.id,
      parentComment,
    });
    
    const comment = await newComment.save();
    
    // Add comment to post's comments array
    post.comments.push(comment._id);
    await post.save();
    
    // Add comment to user's comments array
    user.comments.push(comment._id);
    await user.save();
    
    // Populate author details
    await comment.populate('author', 'username avatar');
    
    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/posts/:id/upvote
// @desc    Upvote a post
// @access  Private
router.put('/:id/upvote', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if post has already been upvoted by user
    if (post.upvotes.includes(req.user.id)) {
      // Remove upvote
      post.upvotes = post.upvotes.filter(userId => userId.toString() !== req.user.id);
      
      const user = await User.findById(req.user.id);
      user.upvotedPosts = user.upvotedPosts.filter(postId => postId.toString() !== post._id.toString());
      await user.save();
    } else {
      // Add upvote
      post.upvotes.push(req.user.id);
      
      // Remove downvote if exists
      post.downvotes = post.downvotes.filter(userId => userId.toString() !== req.user.id);
      
      const user = await User.findById(req.user.id);
      user.upvotedPosts.push(post._id);
      user.downvotedPosts = user.downvotedPosts.filter(postId => postId.toString() !== post._id.toString());
      await user.save();
    }
    
    await post.save();
    
    res.json({
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/posts/:id/downvote
// @desc    Downvote a post
// @access  Private
router.put('/:id/downvote', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if post has already been downvoted by user
    if (post.downvotes.includes(req.user.id)) {
      // Remove downvote
      post.downvotes = post.downvotes.filter(userId => userId.toString() !== req.user.id);
      
      const user = await User.findById(req.user.id);
      user.downvotedPosts = user.downvotedPosts.filter(postId => postId.toString() !== post._id.toString());
      await user.save();
    } else {
      // Add downvote
      post.downvotes.push(req.user.id);
      
      // Remove upvote if exists
      post.upvotes = post.upvotes.filter(userId => userId.toString() !== req.user.id);
      
      const user = await User.findById(req.user.id);
      user.downvotedPosts.push(post._id);
      user.upvotedPosts = user.upvotedPosts.filter(postId => postId.toString() !== post._id.toString());
      await user.save();
    }
    
    await post.save();
    
    res.json({
      upvotes: post.upvotes.length,
      downvotes: post.downvotes.length,
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
