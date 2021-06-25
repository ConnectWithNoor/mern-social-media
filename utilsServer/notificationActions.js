const UserModel = require('../models/UserModel');
const NotificationModel = require('../models/NotificationModel');

const setNotificationToUnread = async (userId) => {
  try {
    const user = await UserModel.findById(userId);

    if (!user.undreadNotification) {
      user.undreadNotification = true;
      await user.save();
    }

    return;
  } catch (error) {
    console.error(error);
  }
};

const newLikeNotification = async (userId, postId, userToNotifyId) => {
  try {
    const userToNotify = await NotificationModel.findOne({
      user: userToNotifyId,
    });

    const newNotification = {
      type: 'newLike',
      user: userId,
      post: postId,
      date: Date.now(),
    };

    await userToNotify.notification.unshift(newNotification);
    await userToNotify.save();

    await setNotificationToUnread(userToNotifyId);
    return;
  } catch (error) {
    console.error(error);
  }
};

const removeLikeNotification = async (userId, postId, userToNotifyId) => {
  try {
    await NotificationModel.findOneAndUpdate(
      { user: userToNotifyId },
      {
        $pull: {
          notification: {
            type: 'newLike',
            user: userId,
            post: postId,
          },
        },
      }
    );

    return;
  } catch (error) {
    console.error(error);
  }
};

const newCommentNotification = async (
  postId,
  commentId,
  userId,
  userToNotifyId,
  text
) => {
  try {
    const userToNotify = await NotificationModel.findOne({
      user: userToNotifyId,
    });

    const newNotification = {
      type: 'newComment',
      user: userId,
      post: postId,
      commentId,
      text,
      date: Date.now(),
    };

    await userToNotify.notification.unshift(newNotification);
    await userToNotify.save();

    await setNotificationToUnread(userToNotifyId);

    return;
  } catch (error) {
    console.error(error);
  }
};

const removeCommentNotification = async (
  postId,
  commentId,
  userId,
  userToNotifyId
) => {
  try {
    await NotificationModel.findOneAndUpdate(
      {
        user: userToNotifyId,
      },
      {
        $pull: {
          notification: {
            type: 'newComment',
            user: userId,
            post: postId,
            commentId,
          },
        },
      }
    );
    return;
  } catch (error) {
    console.error(error);
  }
};

const newFollowerNotification = async (userId, userToNotifyId) => {
  try {
    const user = await NotificationModel.findOne({ user: userToNotifyId });
    const newNotification = {
      type: 'newFollower',
      user: userId,
      date: Date.now(),
    };

    await user.notification.unshift(newNotification);
    await user.save();

    await setNotificationToUnread(userToNotifyId);
    return;
  } catch (error) {
    console.error(error);
  }
};

const removeFollowerNotification = async (userId, userToNotifyId) => {
  try {
    await NotificationModel.findOneAndUpdate(
      {
        user: userToNotifyId,
      },
      {
        $pull: {
          notification: {
            $type: 'newFollower',
            user: userId,
          },
        },
      }
    );
    return;
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  newLikeNotification,
  removeLikeNotification,
  newCommentNotification,
  removeCommentNotification,
  newFollowerNotification,
  removeFollowerNotification,
};
