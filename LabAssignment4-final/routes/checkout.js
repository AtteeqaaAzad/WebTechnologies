// routes/checkout.js
// Checkout page - only logged in users can access

var express    = require('express');
var router     = express.Router();
var authHelper = require('../middleware/auth');

// isLoggedIn middleware protects this route
router.get('/', authHelper.isLoggedIn, function(req, res) {
    res.render('checkout', { pageTitle: 'Checkout - Uniworth' });
});

module.exports = router;
