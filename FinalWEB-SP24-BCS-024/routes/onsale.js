// routes/onsale.js
var express = require('express');
var router  = express.Router();
var Product = require('../models/Product'); // adjust if your model path is different

// GET /onsale-products
router.get('/', async function(req, res) {
    try {
        // Find all products where isOnSale is true
        var products = await Product.find({ isOnSale: true });

        res.render('onsale', {
            products:  products,
            pageTitle: 'On Sale Products'
        });

    } catch (err) {
        console.log('Error:', err);
        res.status(500).send('Something went wrong');
    }
});

module.exports = router;