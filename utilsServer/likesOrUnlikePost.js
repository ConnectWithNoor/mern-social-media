const UserModel = require('../models/UserModel');
const PostModal = require('../models/PostModal');

const {
  newLikeNotification,
  removeLikeNotification,
} = require('./notificationActions');

const likeOrUnlikePost = async (postId, userId, like) => {
  try {
    const post = await PostModal.findById(postId);

    if (!post) return { error: 'No Post Found' };

    if (like) {
      const isLiked =
        post.likes.filter((like) => like.user.toString() === userId).length > 0;

      if (isLiked) return { error: 'Post already liked' };
      await post.likes.unshift({ user: userId });

      await post.save();

      if (post.user.toString() !== userId) {
        await newLikeNotification(userId, postId, post.user.toString());
      }
    } else {
      const isLiked =
        post.likes.filter((like) => like.user.toString() === userId).length ===
        0;

      if (isLiked) return { error: 'Not liked already' };

      const indexOf = post.likes
        .map((like) => like.user.toString())
        .indexOf(userId);

      await post.likes.splice(indexOf, 1);
      await post.save();

      if (post.user.toString() !== userId) {
        await removeLikeNotification(userId, postId, post.user.toString());
      }
    }

    return { success: true };
  } catch (error) {
    return { error: 'Server Error' };
  }
};

module.exports = likeOrUnlikePost;
