const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendGridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const isEmail = require('validator/lib/isEmail');

const UserModel = require('../models/UserModel');

const baseUrl = require('../utils/baseUrl');

const router = express.Router();

const options = {
  auth: {
    api_key: process.env.SENDGRID_API,
  },
};

const transporter = nodemailer.createTransport(sendGridTransport(options));

// CHECK USER EXISTS AND SEND EMAIL TO RESET PASSWORD
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    if (!isEmail(email)) return res.status(401).send('Invalid Email');

    const user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user) return res.status(404).send('User Not Found');

    const token = crypto.randomBytes(32).toString('hex');

    user.resetToken = token;
    // 360000 = 1 hour
    user.expireToken = Date.now() + 3600000;

    await user.save();

    const href = `${baseUrl}/reset/${token}`;

    const mailOptions = {
      to: user.email,
      from: 'noor.m@allshorestaffing.com',
      subject: 'Someone requested for password reset',
      html: `
      <p> Hello ${
        user.name.split(' ')[0]
      }. We recieved a request to reset your password. Please
       <a href=${href}> click here to reset the password</a>
      </p>
      <p> This token is valid for only next 1 hour. </P>
      `,
    };

    await transporter.sendMail(mailOptions, (err, _) => {
      if (err) console.log(err);
    });

    return res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

router.post('/token', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || password.length < 6)
      return res.status(401).send('Invalid token or password');

    const user = await UserModel.findOne({ resetToken: token });
    if (!user) return res.status(404).send('User Not Found');

    if (Date.now() > user.expiredToken)
      res.status(401).send('Token has been expired. Please generate new');

    user.password = await bcrypt.hash(password, 10);

    user.resetToken = '';
    user.expiredToken = null;

    await user.save();

    return res.status(200).send('Password updated successfully');
  } catch (error) {
    console.error(error);
    return res.status(500).send('Something went wrong');
  }
});

module.exports = router;
