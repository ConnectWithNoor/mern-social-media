const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
      select: false,
    },
    username: {
      type: String,
      require: true,
      unique: true,
      trim: true,
    },
    profilePicUrl: {
      type: String,
    },
    newMessagePopup: {
      type: Boolean,
      default: true,
    },
    unreadMessage: {
      type: Boolean,
      default: false,
    },
    unreadNotification: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'root'],
    },
    resetToken: {
      type: String,
    },
    expiredToken: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
