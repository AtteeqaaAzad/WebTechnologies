// routes/products.js
// Shows the products page with search, filter and pagination

var express = require('express');
var router  = express.Router();
var Product = require('../models/Product');

router.get('/', function(req, res) {

    // Read filters from URL (e.g. /products?search=polo&page=2)
    var page     = parseInt(req.query.page) || 1;
    var limit    = 8;
    var skip     = (page - 1) * limit;
    var search   = req.query.search   || '';
    var category = req.query.category || '';
    var minPrice = req.query.minPrice || '';
    var maxPrice = req.query.maxPrice || '';
    var sort     = req.query.sort     || 'newest';

    // Build the database query
    var query = {};

    if (search) {
        query.name = { $regex: search, $options: 'i' };  // search by name
    }
    if (category) {
        query.category = category;  // filter by category
    }
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Sort options
    var sortBy = { createdAt: -1 };  // default: newest first
    if (sort === 'price-low')  sortBy = { price: 1 };
    if (sort === 'price-high') sortBy = { price: -1 };
    if (sort === 'rating')     sortBy = { rating: -1 };
    if (sort === 'name')       sortBy = { name: 1 };

    // Count total products (for pagination)
    Product.countDocuments(query).then(function(total) {
        var totalPages = Math.ceil(total / limit) || 1;

        // Get products for this page
        Product.find(query).sort(sortBy).skip(skip).limit(limit).then(function(products) {

            // Get all unique categories for the sidebar
            Product.distinct('category').then(function(categories) {
                res.render('products', {
                    pageTitle:   'All Products - Uniworth',
                    products:    products,
                    categories:  categories,
                    currentPage: page,
                    totalPages:  totalPages,
                    totalProducts: total,
                    limit:       limit,
                    filters: {
                        search:   search,
                        category: category,
                        minPrice: minPrice,
                        maxPrice: maxPrice,
                        sort:     sort
                    }
                });
            });
        });
    }).catch(function(err) {
        res.status(500).send('Error loading products: ' + err.message);
    });
});

module.exports = router;
