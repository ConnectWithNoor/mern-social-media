const express = require('express');

const UserModel = require('../models/UserModel');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:searchText', authMiddleware, async (req, res) => {
  const { searchText } = req.params;

  if (searchText.length <= 0) return;

  try {
    const results = await UserModel.find({
      name: { $regex: searchText, $options: 'i' },
    });

    return res.json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something Went Wrong. Please try later');
  }
});

module.exports = router;
