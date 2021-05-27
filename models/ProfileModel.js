const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    bio: {
      type: String,
      required: true,
    },
    social: {
      youtube: {
        type: String,
      },
      twitter: {
        type: String,
      },
      facebook: {
        type: String,
      },
      instagram: {
        type: String,
      },
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
