const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticator } = require('otplib');

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate TOTP secret for the user
  const secret = authenticator.generateSecret();

  try {
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      twoFactorSecret: secret
    });
    await newUser.save();
    res.status(201).json("User registered");
  } catch (err) {
    res.status(400).json("User already exists");
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json("User not found");

  // const isMatch = await bcrypt.compare(password, user.password);
  const isMatch = password === user.password;
  if (!isMatch) return res.status(401).json("Invalid credentials");

  if (user.isTwoFactorEnabled) {
    if (!user.twoFactorSecret) {
      const secret = authenticator.generateSecret();
      user.twoFactorSecret = secret;
      await user.save();
      return res.status(200).json({ message: "2FA enabled, please enter the code", secret });
    }
    return res.status(200).json({ message: "2FA enabled, please enter the code", secret: user.twoFactorSecret });
  }

  const authToken  = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.json({ token: authToken , user: { id: user._id, username: user.username } });
});

module.exports = router;
