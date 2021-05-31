const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const userModel = require('../models/UserModel');
const PostModel = require('../models/PostModal');
const FollowerModel = require('../models/FollowerModel');
const UserModel = require('../models/UserModel');

// create a post

router.post('/', authMiddleware, async (req, res) => {
  const { text, location, picUrl } = req.body;

  if (text.trim().length <= 0)
    return res.status(401).send('Text must be atleast 1 word');

  try {
    const newPost = {
      user: req.userId,
      text,
      localtion: location ? location : '',
      picUrl: picUrl ? picUrl : '',
    };

    const post = await new PostModel(newPost).save();

    return res.status(200).send({ post });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

// get all posts

router.get('/', authMiddleware, async (req, res) => {
  try {
    const post = await PostModel.find()
      .sort({ createdAt: -1 })
      .populate('user')
      .populate('comments.user');

    return res.status(200).send({ post });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

// get post by Id
router.get('/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await PostModel.findById(postId);

    if (!post) return res.status(404).send('Post not found');

    return res.status(200).send({ post });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

// delete post by Id
router.delete('/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await PostModel.findById(postId);

    if (!post) return res.status(404).send('Post not found');

    const user = await UserModel.findById(req.userId);

    // if an admin (root user) is deleting the post Or
    // if the post owner itself is deleting the post

    if (user.role === 'root' || post.user.toString() === req.userId) {
      await post.remove();
      return res.status(200).send('Post deleted succesfully');
    }

    return res.status(401).send('You are not allowed to delete that post');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

// Like a post

router.put('/like/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;

    const post = await PostModel.findById(postId);

    if (!post) return res.status(404).send(`Post doesn't exist`);

    const isAlreadyLiked = post.likes.filter(
      (like) => like.user.toString() === userId
    );

    if (isAlreadyLiked.length > 0) {
      return res.status(401).send('Post already liked');
    }

    // if post not already liked so, like it.
    await post.likes.unshift({ user: userId });
    await post.save();

    return res.status(200).send('Post Liked');
  } catch (error) {
    console.error(error);
    return res.status(200).send('Something went wrong');
  }
});

// Unlike a post

router.put('/unlike/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req;

    const post = await PostModel.findById(postId);

    if (!post) return res.status(404).send(`Post doesn't exist`);

    const isLikedIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(userId);

    if (isLikedIndex < 0) {
      return res.status(401).send('Post already not liked');
    }

    // if post already liked so, unlike it.
    await post.likes.splice(isLikedIndex, 1);
    await post.save();

    return res.status(200).send('Post Unliked');
  } catch (error) {
    console.error(error);
    return res.status(400).send('Something went wrong');
  }
});

// get all likes

router.get('/like/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await PostModel.findById(postId).populate('likes.user');

    if (!post) return res.status(404).send(`Post doesn't exist`);

    return res.status(200).send(post.likes);
  } catch (error) {
    console.error(error);
    return res.status(200).send('Something went wrong');
  }
});

module.exports = router;
