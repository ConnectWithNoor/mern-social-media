const express = require('express');
const jwt = require('jsonwebtoken');
const bycrypt = require('bcryptjs');
const isEmail = require('validator/lib/isEmail');

const UserModel = require('../models/UserModel');
const FollowerModel = require('../models/FollowerModel');
const NotificationModel = require('../models/NotificationModel');
const ChatModel = require('../models/ChatModel');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
  const { userId } = req;

  try {
    const user = await UserModel.findById(userId);
    const userFollowStats = await FollowerModel.findOne({ user: userId });

    return res.status(200).send({
      user,
      userFollowStats,
    });
  } catch (error) {
    console.error(error);
    return res.status(401).send('Something went wrong. Please try later');
  }
});

// create a new user

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body.user;

    if (!isEmail(email) || password.length < 6)
      return res.status(401).send(`Email and/or password is badly formatted`);

    const user = await UserModel.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) return res.status(401).send(`Invalid credentials`);

    const isCorrectPassword = await bycrypt.compare(password, user.password);

    if (!isCorrectPassword) return res.status(401).send(`Invalid credentials`);

    //
    const notificationModel = await NotificationModel.findOne({
      user: user._id,
    });

    if (!notificationModel) {
      await new NotificationModel({ user: user._id, notification: [] }).save();
    }

    const chatModel = await ChatModel.findOne({
      user: user._id,
    });

    if (!chatModel) {
      await new ChatModel({ user: user._id, chats: [] }).save();
    }

    // sending jwtresponse to frontend

    jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '2d' },
      (err, token) => {
        if (err) throw err;

        return res.status(200).json({
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
