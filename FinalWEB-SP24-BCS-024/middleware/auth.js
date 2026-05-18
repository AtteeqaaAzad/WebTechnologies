// middleware/auth.js
// Functions that check if user is logged in or is admin

// Check if user is logged in
function isLoggedIn(req, res, next) {
    if (req.session.userId) {
        next();  // user is logged in, continue
    } else {
        req.flash('error', 'Please log in first.');
        res.redirect('/auth/login');
    }
}

// Check if user is an admin
function isAdmin(req, res, next) {
    if (!req.session.userId) {
        req.flash('error', 'Please log in first.');
        return res.redirect('/auth/login');
    }

    if (req.session.role !== 'admin') {
        req.flash('error', 'Access Denied. Admins only.');
        return res.redirect('/');
    }

    next();  // user is admin, continue
}

// Check if user is a guest (not logged in)
// Used on login/register pages so logged-in users dont see them
function isGuest(req, res, next) {
    if (req.session.userId) {
        res.redirect('/');  // already logged in, go home
    } else {
        next();  // not logged in, show the page
    }
}

module.exports = { isLoggedIn, isAdmin, isGuest };
