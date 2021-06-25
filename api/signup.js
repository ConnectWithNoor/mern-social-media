const express = require('express');
const jwt = require('jsonwebtoken');
const bycrypt = require('bcryptjs');
const isEmail = require('validator/lib/isEmail');

const UserModel = require('../models/UserModel');
const FollowerModel = require('../models/FollowerModel');
const ProfileModel = require('../models/ProfileModel');
const NotificationModel = require('../models/NotificationModel');
const ChatModel = require('../models/ChatModel');

const { userPng } = require('../utilsServer/userPng');
const { regexUserName } = require('../utils/regex');

const router = express.Router();

// check if username exists
router.get('/:username', async (req, res) => {
  const { username } = req.params;
  try {
    if (username.length < 1 || !regexUserName.test(username))
      return res.status(401).send(`Username is empty or badly formatted`);
    const isUserExist = await UserModel.findOne({ username });

    if (isUserExist) return res.status(401).send(`Username is not available`);

    return res.status(200).send('User is available');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something Went Wrong. Please Try again');
  }
});

// create a new user

router.post('/', async (req, res) => {
  try {
    let user = {};
    let profile = {};
    let followers = {};

    const {
      name,
      email,
      username,
      password,
      bio,
      facebook,
      youtube,
      twitter,
      instagram,
    } = req.body.user;

    if (!isEmail(email) || password.length < 6)
      return res.status(401).send(`Email and/or password is badly formatted`);

    user = await UserModel.findOne({ email: email.toLowerCase() });

    if (user) return res.status(401).send(`User already exists`);

    // Creating User Model
    user = new UserModel({
      name,
      email: email.toLowerCase(),
      username,
      password,
      profilePicUrl: req.body.profilePicUrl || userPng,
    });

    user.password = await bycrypt.hash(password, 10);

    await user.save();

    // Creating Profile Model

    profile = {
      user: user._id,
      bio,
      social: {
        facebook: facebook || '',
        twitter: twitter || '',
        youtube: youtube || '',
        instagram: instagram || '',
      },
    };

    await new ProfileModel(profile).save();

    // Creating Follwers Model

    followers = {
      user: user._id,
      followers: [],
      following: [],
    };

    await new FollowerModel(followers).save();

    // Creating Notification Object for the user
    await new NotificationModel({ user: user._id, notification: [] }).save();
    // Creating Chat Object for the user
    await new ChatModel({ user: user._id, chats: [] }).save();
    // sending jwtresponse to frontend

    jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '2d' },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          userId: user._id,
          token,
        });
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something Went Wrong. Please Try again');
  }
});

module.exports = router;
