const express = require('express');
const bcrypt = require('bcryptjs');

const authMiddleware = require('../middleware/authMiddleware');

const UserModel = require('../models/UserModel');
const PostModel = require('../models/PostModal');
const FollowerModel = require('../models/FollowerModel');
const ProfileModel = require('../models/ProfileModel');

const router = express.Router();

// Get profile Info

router.get('/:username', authMiddleware, async (req, res) => {
  const { username } = req.params;
  try {
    const user = await UserModel.findOne({ username: username.toLowerCase() });

    if (!user) return res.status(404).send('User not found');

    const profile = await ProfileModel.findOne({ user: user._id }).populate(
      'user'
    );

    const profileFollowStats = await FollowerModel.findOne({ user: user._id });

    return res.status(200).send({
      profile,
      followersLength: profileFollowStats.followers.length,
      followingLength: profileFollowStats.following.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

// Get posts of a user

router.get('/post/:username', authMiddleware, async (req, res) => {
  const { username } = req.params;

  try {
    const user = await UserModel.findOne({ username: username.toLowerCase() });

    if (!user) return res.status(404).send('User not found');

    const posts = await PostModel.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('user')
      .populate('comments.user');

    return res.status(200).send(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

// Get followers

router.get('/followers/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await FollowerModel.findOne({
      user: userId,
    }).populate('followers.user');

    if (!user) return res.status(404).send('User not found');

    return res.status(200).send(user.followers);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

// Get following

router.get('/following/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await FollowerModel.findOne({
      user: userId,
    }).populate('following.user');

    if (!user) return res.status(404).send('User not found');

    return res.status(200).send(user.following);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

// Follow a user

router.put('/follow/:userToFollowId', authMiddleware, async (req, res) => {
  const { userToFollowId } = req.params;
  const { userId } = req;

  try {
    const user = await FollowerModel.findOne({ user: userId });
    const userToFollow = await FollowerModel.findOne({
      user: userToFollowId,
    });

    if (!user || !userToFollow) return res.status(404).send('User not found');

    // checking if already following
    const isAlreadyFollowing =
      user.following.filter(
        (following) => following.user.toString() === userToFollowId
      ).length > 0;

    if (isAlreadyFollowing)
      return res.status(401).send('User Already Followed');

    //   adding userToFollowId in following of user
    await user.following.unshift({ user: userToFollowId });
    await user.save();

    // adding  user's id on userToFollowId's followers

    await userToFollow.followers.unshift({ user: userId });
    await userToFollow.save();

    return res.status(200).send('User has been followed successfully.');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

// Unfollow a user
router.put('/unfollow/:userToUnfollowId', authMiddleware, async (req, res) => {
  const { userToUnfollowId } = req.params;
  const { userId } = req;

  try {
    const user = await FollowerModel.findOne({ user: userId });
    const userToUnfollow = await FollowerModel.findOne({
      user: userToUnfollowId,
    });

    if (!user || !userToUnfollow) return res.status(404).send('User not found');

    // checking if not already following
    const isNotAlreadyFollowing =
      user.following.filter(
        (following) => following.user.toString() === userToUnfollowId
      ).length <= 0;

    if (isNotAlreadyFollowing) return res.status(401).send('User Not Followed');

    //   removeing userToFollowId in following of user
    const removeFollowingIndex = user.following
      .map((following) => following.user.toString())
      .indexOf(userToUnfollowId);

    await user.following.splice(removeFollowingIndex, 1);
    await user.save();

    // remove  user's id on userToFollowId's followers
    const removeFollowersIndex = user.followers
      .map((follower) => follower.user.toString())
      .indexOf(userToUnfollowId);
    await userToUnfollow.followers.splice(removeFollowersIndex, 1);
    await userToUnfollow.save();

    return res.status(200).send('User has been unfollowed successfully.');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

// update a profile
// NOT TESTED YET

router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const { bio, facebook, youtube, twitter, instagram, profilePicUrl } =
      req.body;
    let profile = {};

    // Creating Profile Model

    profile = {
      user: userId,
      bio,
      social: {
        facebook: facebook || '',
        twitter: twitter || '',
        youtube: youtube || '',
        instagram: instagram || '',
      },
    };

    await ProfileModel.findByIdAndUpdate(
      { user: userId },
      { $set: profile },
      { new: true }
    );

    if (profilePicUrl) {
      const user = await UserModel.findById(userId);
      user.profilePicUrl = profilePicUrl;
      await user.save();
    }

    return res.status(200).send('User has been updated successfully.');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

// update password
// NOT TESTED

router.post('/settings/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (newPassword.length < 6)
      return res.status(401).send('Password must be atleast 6 characters');

    const user = await UserModel.findById(req.userId).select('+password');

    const isPassword = await bcrypt.compare(currentPassword, user.password);

    if (!isPassword) return res.status(401).send('Invalid Password');

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.status(200).send('Password has been updated successfully.');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

// Update Message popup settings

router.post('/settings/messagePopup', authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (user.newMessagePopup) {
      user.newMessagePopup = false;
      user.save();
    } else {
      user.newMessagePopup = true;
      user.save();
    }
    return res.status(200).send('Message Popup has been updated successfully.');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

module.exports = router;
