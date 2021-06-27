const express = require('express');

const ChatModel = require('../models/ChatModel');
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

module.exports = router;
