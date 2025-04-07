const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  twoFactorSecret: { type: String }, // Stores the TOTP secret
  isTwoFactorEnabled: { type: Boolean, default: true } // Whether 2FA is enabled
});

module.exports = mongoose.model('User', userSchema);
