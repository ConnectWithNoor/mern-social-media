const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');
const NotificationModel = require('../models/NotificationModel');
const UserModel = require('../models/UserModel');

const router = express.Router();

router.get(`/`, authMiddleware, async (req, res) => {
  try {
    const { userId } = req;

    const user = await NotificationModel.findOne({ user: userId })
      .populate('notification.user')
      .populate('notification.post');

    return res.status(200).send({ notifications: user.notification });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
});

router.post(`/`, authMiddleware, async (req, res) => {
  try {
    const { userId } = req;

    const user = await UserModel.findById(userId);

    if (user.unreadNotification) {
      user.unreadNotification = false;
      await user.save();
    }

    return res.status(200).send('All Notifications read. No new Notification');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
