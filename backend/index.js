require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./db');
const { sendOTP, verifyOTP } = require('./auth/emailOTP');
const User = require('./models/user');
const bcrypt = require('bcrypt');
require('./auth/google');

connectDB();

const app = express();
app.use(express.json());

function isLoggedIn(req, res, next) {
    if (req.user){
        next();
    } else {
        console.log('security breach');
        res.sendStatus(401);
    } 
};
 
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// ─── Google OAuth ───────────────────────────────────────
app.get('/', (req, res) => {
    res.send("hi <a href='/auth/google'> login here with google</a>");
});

app.get('/auth/google', passport.authenticate('google', {scope: ['email', 'profile'], prompt: 'select_account'}));

app.get('/69s/callback',
    passport.authenticate('google', {
        successRedirect: '/login',
        failureRedirect: '/unauthorise',
    })
);

app.get('/login', isLoggedIn, (req, res) => {
    res.send(`login successful! ${req.user.displayName} <a href='/logout'> LOGOUT</a>`);
});

app.get('/unauthorise', (req, res) => {
    res.send("login failed! <a href='/auth/google'> login here with google</a>")
});

app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.session.destroy();
        res.send('GOODBYE! Thanks for signing in!   69series~');
    });
});

// ─── Email Signup - Step 1: Send OTP ────────────────────
app.post('/signup/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    try {
        await sendOTP(email);
        res.json({ message: 'OTP sent to your email!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

// ─── Email Signup - Step 2: Verify OTP + Set Password ───
app.post('/signup/verify-otp', async (req, res) => {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) return res.status(400).json({ message: 'All fields required' });

    const isValid = verifyOTP(email, otp);
    if (!isValid) return res.status(400).json({ message: 'Invalid or expired OTP' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            password: hashedPassword,
            displayName: email.split('@')[0],
            isVerified: true,
        });
        console.log('New user created!', user);
        res.json({ message: 'Signup successful!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Signup failed' });
    }
});

// ─── Email Signin ────────────────────────────────────────
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'All fields required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (!user.isVerified) return res.status(400).json({ message: 'Email not verified' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Wrong password' });

    req.session.user = user;
    res.json({ message: `Welcome back ${user.displayName}!` });
});

app.listen(8080, () => {
    console.log('server on http://localhost:8080');
});