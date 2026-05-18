
// app.js — Main Server File


// Load environment variables from .env file
require('dotenv').config();

// Import packages
var express      = require('express');
var mongoose     = require('mongoose');
var session      = require('express-session');
var MongoStore   = require('connect-mongo');
var flash        = require('connect-flash');
var methodOverride = require('method-override');
var path         = require('path');
var ejsLayouts = require('express-ejs-layouts');
// Import route files
var productRoutes  = require('./routes/products');
var adminRoutes    = require('./routes/admin');
var authRoutes     = require('./routes/auth');
var checkoutRoutes = require('./routes/checkout');
var apiRoutes      = require('./routes/api');
var onsaleRoutes   = require('./routes/onsale');  

// Create the express app
var app  = express();
var PORT = process.env.PORT || 3000;
var DB   = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uniworth';

// ─── Connect to MongoDB ───
mongoose.connect(DB).then(function() {
    console.log('Connected to MongoDB');
}).catch(function(err) {
    console.log('MongoDB error: ' + err.message);
});

// ─── Set EJS as the view engine ───
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(ejsLayouts);   // ADD THIS LINE

// ─── Serve public folder (CSS, images, JS) ───
app.use(express.static(path.join(__dirname, 'public')));

// ─── Read data from HTML forms ───
app.use(express.urlencoded({ extended: true }));

// ─── Read JSON data (for API requests) ───
app.use(express.json());

// ─── Allow PUT and DELETE from HTML forms ───
app.use(methodOverride('_method'));

// ─── Setup sessions (keeps users logged in, stored in MongoDB) ───
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: DB,           // save sessions in MongoDB
        collectionName: 'sessions',
        ttl: 60 * 60 * 24      // sessions expire after 1 day
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }  // cookie lasts 1 day
}));

// ─── Setup flash messages ───
app.use(flash());

// ─── Make user info available on every page ───
app.use(function(req, res, next) {

    // If user is logged in, save their info to res.locals
    if (req.session.userId) {
        res.locals.currentUser = {
            id:    req.session.userId,
            name:  req.session.userName,
            email: req.session.userEmail,
            role:  req.session.role
        };
    } else {
        res.locals.currentUser = null;
    }

    // Make flash messages available to all views
    res.locals.success = req.flash('success');
    res.locals.error   = req.flash('error');

    // Support logout message passed in URL
    if (req.query.message) {
        res.locals.success = [req.query.message];
    }

    next();
});


// ROUTES

// Home page
app.get('/', function(req, res) {
    res.render('index', { pageTitle: 'Uniworth - Premium Mens Fashion' });
});

// Cart page
app.get('/cart', function(req, res) {
    res.render('cart', { pageTitle: 'Shopping Cart - Uniworth' });
});

// All other routes
app.use('/products', productRoutes);
app.use('/auth',     authRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/admin',    adminRoutes);
app.use('/api/v1',   apiRoutes);
app.use('/onsale-products', onsaleRoutes);  

// ─── Page not found (404) ───
app.use(function(req, res) {
    if (req.path.startsWith('/api')) {
        res.status(404).json({ success: false, message: 'API route not found' });
    } else {
        res.status(404).send('<h1>404 - Page Not Found</h1><a href="/">Go Home</a>');
    }
});

//  Start the server 
app.listen(PORT, function() {
    console.log('Server running at http://localhost:' + PORT);
    console.log('Admin panel:  http://localhost:' + PORT + '/admin');
    console.log('API docs:     http://localhost:' + PORT + '/api/v1');
});
