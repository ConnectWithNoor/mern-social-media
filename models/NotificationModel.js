const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notification: [
    {
      type: {
        type: String,
        enum: ['newLike', 'newComment', 'newFollower'],
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
      commentId: {
        type: String,
      },
      text: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model('Notification', NotificationSchema);
