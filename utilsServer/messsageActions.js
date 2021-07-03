const ChatModel = require('../models/ChatModel');
const UserModel = require('../models/UserModel');

const loadMessages = async (userId, messagesWith) => {
  try {
    const user = await ChatModel.findOne({ user: userId }).populate(
      'chats.messagesWith'
    );

    const chat = user.chats.find(
      (chat) => chat.messagesWith._id.toString() === messagesWith
    );

    if (!chat) return { error: 'No Chat Found' };

    return { chat };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

const sendMsg = async (userId, msgSendToUserId, msg) => {
  try {
    // logged on user
    const user = await ChatModel.findOne({ user: userId });

    // receiver
    const msgSendToUser = await ChatModel.findOne({ user: msgSendToUserId });

    const newMsg = {
      sender: userId,
      receiver: msgSendToUserId,
      msg,
      date: Date.now(),
    };

    const previousChat = user.chats.find(
      (chat) => chat.messagesWith.toString() === msgSendToUserId
    );

    if (previousChat) {
      previousChat.messages.push(newMsg);
      await user.save();
    } else {
      // if no previous chat
      const newChat = { messagesWith: msgSendToUserId, messages: [newMsg] };

      user.chats.unshift(newChat);
      await user.save();
    }

    const previousChatForReceiver = msgSendToUser.chats.find(
      (chat) => chat.messagesWith.toString() === userId
    );

    if (previousChatForReceiver) {
      previousChatForReceiver.messages.push(newMsg);
      await msgSendToUser.save();
    } else {
      // if no previous  chat
      const newChat = { messagesWith: userId, messages: [newMsg] };
      msgSendToUser.chats.unshift(newChat);
      await msgSendToUser.save();
    }

    return { newMsg };
  } catch (error) {
    console.error(error);
    return { error };
  }
};

const setMsgToUnread = async (userId) => {
  try {
    const user = await UserModel.findById(userId);

    if (!user.unreadMessage) {
      user.unreadMessage = true;
      await user.save();
    }
    return;
  } catch (error) {
    console.error(error);
  }
};

const deleteMsg = async (userId, messagesWith, messageId) => {
  try {
    const user = await ChatModel.findOne({ user: userId });
    const chat = user.chats.find(
      (chat) => chat.messagesWith.toString() === messagesWith
    );

    if (!chat) return;

    const messageToDelete = chat.messages.find(
      (message) => message._id.toString() === messageId
    );

    if (!messageToDelete) return;

    // if msg is not from the same user requesting to delete it.
    if (messageToDelete.sender.toString() !== userId) return;

    const index = chat.messages
      .map((message) => message._id.toString())
      .indexOf(messageToDelete._id.toString());

    await chat.messages.splice(index, 1);
    await user.save();
    return { success: true };
  } catch (error) {
    console.error(error);
  }
};

module.exports = { loadMessages, sendMsg, setMsgToUnread, deleteMsg };
