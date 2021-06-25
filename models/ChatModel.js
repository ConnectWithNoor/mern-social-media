const mongoose = require('mongoose');

const ChatSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  chats: [
    {
      messagesWith: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      messages: [
        {
          msg: {
            type: String,
            required: true,
          },
          sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          date: {
            type: Date,
          },
        },
      ],
    },
  ],
});

module.exports = mongoose.model('Chat', ChatSchema);
