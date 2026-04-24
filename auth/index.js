require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const connectDB = require('./db');
require('./gauth');

connectDB();

const app = express();

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

app.get('/', (req, res) => {
    res.send("hi <a href='/auth/google'> login here with google</a>");
    console.log('processing');
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
    console.log('Success!');
});

app.get('/unauthorise', (req, res) => {
    res.send("login failed! <a href='/auth/google'> login here with google</a>")
    console.log('unauthorise login!');
});


app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.session.destroy();
        res.send('GOODBYE!, 69series here! THANKs for the signing in, U OWE ME ONE! GOOD DAY SIR');
    });
});
app.listen(8080, () => {
    console.log('server on http://localhost:8080');
});