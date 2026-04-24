const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Google OAuth fields
    googleId: String,
    displayName: String,

    // Email/password fields
    email: { type: String, unique: true },
    password: String,
    isVerified: { type: Boolean, default: false },
});

const User = mongoose.model('User', userSchema);

module.exports = User;