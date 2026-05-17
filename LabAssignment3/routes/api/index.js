// routes/api/index.js
// REST API endpoints - returns JSON, not HTML
// Public:    GET  /api/v1/products
//            GET  /api/v1/products/:id
//            POST /api/v1/auth/login
// Protected: GET  /api/v1/user/profile   (needs JWT token)
//            POST /api/v1/orders         (needs JWT token)
//            GET  /api/v1/orders         (needs JWT token)

var express     = require('express');
var router      = express.Router();
var jwt         = require('jsonwebtoken');
var Product     = require('../../models/Product');
var User        = require('../../models/User');
var Order       = require('../../models/Order');
var verifyToken = require('../../middleware/verifyToken').verifyToken;

// ─────────────────────────────────────────
// API DOCS - show available endpoints
// ─────────────────────────────────────────

router.get('/', function(req, res) {
    res.json({
        message: 'Uniworth API v1',
        publicEndpoints: {
            'POST /api/v1/auth/login':   'Login and get a token',
            'GET  /api/v1/products':     'Get all products',
            'GET  /api/v1/products/:id': 'Get one product'
        },
        protectedEndpoints: {
            note: 'Add header: Authorization: Bearer <your-token>',
            'GET  /api/v1/user/profile': 'Get your profile',
            'POST /api/v1/orders':       'Place an order',
            'GET  /api/v1/orders':       'Get your orders'
        },
        demoAccounts: {
            admin:    { email: 'admin@uniworth.com',    password: 'admin123' },
            customer: { email: 'customer@uniworth.com', password: 'customer123' }
        }
    });
});

// ─────────────────────────────────────────
// AUTH - Login and get JWT token
// ─────────────────────────────────────────

router.post('/auth/login', function(req, res) {
    var email    = req.body.email;
    var password = req.body.password;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    User.findOne({ email: email }).then(function(user) {
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        user.checkPassword(password, function(err, isMatch) {
            if (err || !isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password.' });
            }

            // Create JWT token with user info inside
            var token = jwt.sign(
                { user_id: user._id, role: user.role, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES || '1h' }
            );

            res.json({
                success: true,
                message: 'Login successful!',
                token: token,
                user: { id: user._id, name: user.name, email: user.email, role: user.role }
            });
        });
    }).catch(function(err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    });
});

// ─────────────────────────────────────────
// PRODUCTS - Public endpoints
// ─────────────────────────────────────────

// Get all products with optional search/filter/pagination
router.get('/products', function(req, res) {
    var page     = parseInt(req.query.page) || 1;
    var limit    = parseInt(req.query.limit) || 8;
    var skip     = (page - 1) * limit;
    var search   = req.query.search   || '';
    var category = req.query.category || '';
    var minPrice = req.query.minPrice || '';
    var maxPrice = req.query.maxPrice || '';
    var sort     = req.query.sort     || 'newest';

    var query = {};
    if (search)   query.name     = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    var sortBy = { createdAt: -1 };
    if (sort === 'price-low')  sortBy = { price: 1 };
    if (sort === 'price-high') sortBy = { price: -1 };
    if (sort === 'rating')     sortBy = { rating: -1 };

    Product.countDocuments(query).then(function(total) {
        Product.find(query).sort(sortBy).skip(skip).limit(limit).then(function(products) {
            res.json({
                success: true,
                pagination: {
                    currentPage: page,
                    totalPages:  Math.ceil(total / limit),
                    total:       total
                },
                products: products
            });
        });
    }).catch(function(err) {
        res.status(500).json({ success: false, message: 'Could not fetch products.' });
    });
});

// Get one product by ID
router.get('/products/:id', function(req, res) {
    Product.findById(req.params.id).then(function(product) {
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }
        res.json({ success: true, product: product });
    }).catch(function(err) {
        res.status(400).json({ success: false, message: 'Invalid product ID.' });
    });
});

// ─────────────────────────────────────────
// USER PROFILE - Protected (needs token)
// ─────────────────────────────────────────

router.get('/user/profile', verifyToken, function(req, res) {
    User.findById(req.user.user_id).then(function(user) {
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        Order.countDocuments({ userId: user._id }).then(function(orderCount) {
            res.json({
                success: true,
                user: {
                    id:   user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    memberSince: user.createdAt
                },
                totalOrders: orderCount
            });
        });
    }).catch(function(err) {
        res.status(500).json({ success: false, message: 'Could not load profile.' });
    });
});

// ─────────────────────────────────────────
// ORDERS - Protected (needs token)
// ─────────────────────────────────────────

// Place a new order
router.post('/orders', verifyToken, function(req, res) {
    var items           = req.body.items;
    var userId          = req.user.user_id;
    var shippingAddress = req.body.shippingAddress || {};

    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Order must have at least one item.' });
    }

    var orderItems  = [];
    var totalAmount = 0;
    var index       = 0;

    // Process each item one by one
    function processItem() {
        if (index >= items.length) {
            // All items processed, create the order
            var newOrder = new Order({
                userId:      userId,
                items:       orderItems,
                totalAmount: totalAmount,
                status:      'pending',
                street:      shippingAddress.street || '',
                city:        shippingAddress.city   || ''
            });

            newOrder.save().then(function(order) {
                res.status(201).json({
                    success: true,
                    message: 'Order placed successfully!',
                    order: order
                });
            }).catch(function(err) {
                res.status(500).json({ success: false, message: 'Could not save order.' });
            });
            return;
        }

        var item = items[index];
        Product.findById(item.productId).then(function(product) {
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found: ' + item.productId });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: 'Not enough stock for: ' + product.name });
            }

            orderItems.push({
                productId: product._id,
                name:      product.name,
                price:     product.price,
                quantity:  item.quantity
            });

            totalAmount += product.price * item.quantity;

            // Reduce stock
            product.stock = product.stock - item.quantity;
            product.save().then(function() {
                index++;
                processItem();  // process next item
            });
        }).catch(function(err) {
            res.status(400).json({ success: false, message: 'Invalid product ID.' });
        });
    }

    processItem();
});

// Get current user's orders
router.get('/orders', verifyToken, function(req, res) {
    Order.find({ userId: req.user.user_id }).sort({ createdAt: -1 }).then(function(orders) {
        res.json({ success: true, count: orders.length, orders: orders });
    }).catch(function(err) {
        res.status(500).json({ success: false, message: 'Could not fetch orders.' });
    });
});

// 404 for unknown API routes
router.use(function(req, res) {
    res.status(404).json({ success: false, message: 'API route not found.' });
});

module.exports = router;
