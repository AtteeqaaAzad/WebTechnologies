// routes/auth.js
// Handles login, register, logout, and profile

var express    = require('express');
var router     = express.Router();
var User       = require('../models/User');
var authHelper = require('../middleware/auth');

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────

// Show register form
router.get('/register', authHelper.isGuest, function(req, res) {
    res.render('auth/register', {
        pageTitle: 'Register - Uniworth',
        oldName:  '',
        oldEmail: ''
    });
});

// Process register form
router.post('/register', authHelper.isGuest, function(req, res) {
    var name            = req.body.name;
    var email           = req.body.email;
    var password        = req.body.password;
    var confirmPassword = req.body.confirmPassword;

    // Basic validation
    if (!name || !email || !password) {
        req.flash('error', 'All fields are required.');
        return res.render('auth/register', { pageTitle: 'Register', oldName: name, oldEmail: email });
    }

    if (password.length < 6) {
        req.flash('error', 'Password must be at least 6 characters.');
        return res.render('auth/register', { pageTitle: 'Register', oldName: name, oldEmail: email });
    }

    if (password !== confirmPassword) {
        req.flash('error', 'Passwords do not match.');
        return res.render('auth/register', { pageTitle: 'Register', oldName: name, oldEmail: email });
    }

    // Check if email already exists
    User.findOne({ email: email }).then(function(existingUser) {
        if (existingUser) {
            req.flash('error', 'An account with this email already exists.');
            return res.render('auth/register', { pageTitle: 'Register', oldName: name, oldEmail: email });
        }

        // Create new user (password gets hashed by the pre-save hook)
        var newUser = new User({
            name:  name,
            email: email,
            password: password,
            role: 'customer'
        });

        newUser.save().then(function(savedUser) {
            // Log them in straight away
            req.session.userId    = savedUser._id;
            req.session.userName  = savedUser.name;
            req.session.userEmail = savedUser.email;
            req.session.role      = savedUser.role;

            req.flash('success', 'Welcome to Uniworth, ' + savedUser.name + '!');
            res.redirect('/');
        }).catch(function(err) {
            req.flash('error', 'Registration failed: ' + err.message);
            res.redirect('/auth/register');
        });
    });
});

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────

// Show login form
router.get('/login', authHelper.isGuest, function(req, res) {
    res.render('auth/login', { pageTitle: 'Login - Uniworth' });
});

// Process login form
router.post('/login', authHelper.isGuest, function(req, res) {
    var email    = req.body.email;
    var password = req.body.password;

    if (!email || !password) {
        req.flash('error', 'Email and password are required.');
        return res.redirect('/auth/login');
    }

    // Find user by email
    User.findOne({ email: email }).then(function(user) {
        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/auth/login');
        }

        // Check if password matches
        user.checkPassword(password, function(err, isMatch) {
            if (err || !isMatch) {
                req.flash('error', 'Invalid email or password.');
                return res.redirect('/auth/login');
            }

            // Password is correct - save to session
            req.session.userId    = user._id;
            req.session.userName  = user.name;
            req.session.userEmail = user.email;
            req.session.role      = user.role;

            req.flash('success', 'Welcome back, ' + user.name + '!');

            // Admins go to admin panel, customers go to home
            if (user.role === 'admin') {
                res.redirect('/admin');
            } else {
                res.redirect('/');
            }
        });
    }).catch(function(err) {
        req.flash('error', 'Login failed. Please try again.');
        res.redirect('/auth/login');
    });
});

// ─────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────

router.get('/logout', function(req, res) {
    var name = req.session.userName;
    req.session.destroy(function() {
        res.redirect('/?message=Goodbye ' + name + '! You have been logged out.');
    });
});

// ─────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────

router.get('/profile', authHelper.isLoggedIn, function(req, res) {
    User.findById(req.session.userId).then(function(user) {
        res.render('auth/profile', { pageTitle: 'My Profile - Uniworth', user: user });
    }).catch(function() {
        req.flash('error', 'Could not load profile.');
        res.redirect('/');
    });
});

module.exports = router;
