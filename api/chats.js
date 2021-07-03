const express = require('express');

const ChatModel = require('../models/ChatModel');
const UserModel = require('../models/UserModel');
const authMiddleWare = require('../middleware/authMiddleware');

const router = express.Router();

// Get all chats

router.get('/', authMiddleWare, async (req, res) => {
  try {
    const { userId } = req;

    const user = await ChatModel.findOne({ user: userId }).populate(
      'chats.messagesWith'
    );

    const chatsToBeSent = await user.chats.map((chat) => ({
      messagesWith: chat.messagesWith._id,
      name: chat.messagesWith.name,
      profilePicUrl: chat.messagesWith.profilePicUrl,
      lastMessage: chat.messages[chat.messages.length - 1].msg,
      date: chat.messages[chat.messages.length - 1].date,
    }));

    return res.status(200).send({ chats: chatsToBeSent });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

// Get User Info

router.get('/user/:userToFindId', authMiddleWare, async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userToFindId);

    if (!user) return res.status(404).send('No User Found');

    return res
      .status(200)
      .send({ name: user.name, profilePicUrl: user.profilePicUrl });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

module.exports = router;
