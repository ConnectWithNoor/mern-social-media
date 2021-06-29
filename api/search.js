const express = require('express');

const UserModel = require('../models/UserModel');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:searchText', authMiddleware, async (req, res) => {
  const { searchText } = req.params;
  const { userId } = req;

  if (searchText.length <= 0) return;

  try {
    const results = await UserModel.find({
      name: { $regex: searchText, $options: 'i' },
    });

    const resultsToBeSent = await results.filter(
      (result) => result._id.toString() !== userId
    );

    return res.status(200).json(resultsToBeSent);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something Went Wrong. Please try later');
  }
});

module.exports = router;
