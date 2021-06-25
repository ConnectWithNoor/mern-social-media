const express = require('express');
const uuid = require('uuid').v4;

const authMiddleware = require('../middleware/authMiddleware');
const userModel = require('../models/UserModel');
const PostModel = require('../models/PostModal');
const FollowerModel = require('../models/FollowerModel');
const UserModel = require('../models/UserModel');

const {
  removeLikeNotification,
  newLikeNotification,
  newCommentNotification,
  removeCommentNotification,
} = require('../utilsServer/notificationActions');

const router = express.Router();
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

    return res.status(200).send({ _id: post._id });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

// get all posts

router.get('/', authMiddleware, async (req, res) => {
  const { pageNumber } = req.query;
  const { userId } = req;
  const number = Number(pageNumber);
  const size = 8;

  try {
    const loggedUser = await FollowerModel.findOne({ user: userId }).select(
      '-followers'
    );
    let post = [];

    if (number === 1) {
      if (loggedUser.following.length > 0) {
        post = await PostModel.find({
          user: {
            $in: [
              userId,
              ...loggedUser.following.map((following) => following.user),
            ],
          },
        })
          .limit(size)
          .sort({ createdAt: -1 })
          .populate('user')
          .populate('comments.user');
      } else {
        post = await PostModel.find({ user: userId })
          .limit(size)
          .sort({ createdAt: -1 })
          .populate('user')
          .populate('comments.user');
      }
    } else {
      const skips = size * (number - 1);
      if (loggedUser.following.length > 0) {
        post = await PostModel.find({
          user: {
            $in: [
              userId,
              ...loggedUser.following.map((following) => following.user),
            ],
          },
        })
          .skip(skips)
          .limit(size)
          .sort({ createdAt: -1 })
          .populate('user')
          .populate('comments.user');
      } else {
        post = await PostModel.find({ user: userId })
          .skip(skips)
          .limit(size)
          .sort({ createdAt: -1 })
          .populate('user')
          .populate('comments.user');
      }
    }

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

    const post = await PostModel.findById(postId)
      .populate('user')
      .populate('comments.user');

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

    if (post.user.toString() !== userId) {
      await newLikeNotification(userId, postId, post.user.toString());
    }

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

    if (post.user.toString() !== userId) {
      await removeLikeNotification(userId, postId, post.user.toString());
    }

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

// create a comment

router.post('/comment/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const { userId } = req;

    if (text.length <= 0)
      return res.status(401).send('comment should not be empty');

    const post = await PostModel.findById(postId);

    if (!post) return res.status(404).send('No post found');
    const newComment = {
      _id: uuid(),
      text,
      user: userId,
      date: Date.now(),
    };

    await post.comments.unshift(newComment);
    await post.save();

    if (post.user.toString() !== userId) {
      await newCommentNotification(
        postId,
        newComment._id,
        userId,
        post.user.toString(),
        text
      );
    }

    return res.status(200).send({
      _id: newComment._id,
    });
  } catch (error) {
    console.error(error);
    return res.status(200).send('Something went wrong');
  }
});

// Delete a comment

router.delete('/:postId/:commentId', authMiddleware, async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await PostModel.findById(postId);

    if (!post) return res.status(404).send('Post not found');

    const comment = post.comments.find((comment) => comment._id === commentId);

    if (!comment) return res.status(404).send('Comment not found');

    const user = await UserModel.findById(req.userId);

    // if an admin (root user) is deleting the comment Or
    // if the comment owner itself is deleting the comment
    if (user.role === 'root' || comment.user.toString() === req.userId) {
      const index = post.comments
        .map((comment) => comment._id)
        .indexOf(commentId);

      await post.comments.splice(index, 1);
      await post.save();

      if (comment.user.toString() !== req.userId) {
        await removeCommentNotification(
          postId,
          commentId,
          req.userId,
          post.user.toString()
        );
      }

      return res.status(200).send('Comment deleted succesfully');
    }

    return res.status(401).send('You are not allowed to delete that comment');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

module.exports = router;
