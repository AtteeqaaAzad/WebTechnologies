// ============================================
// app.js — Uniworth E-Commerce + Admin Panel
// Assignment 4
// ============================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');

const productsRouter = require('./routes/products');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uniworth';

// ─── Connect to MongoDB ───
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB connected:', MONGO_URI))
    .catch(err => console.error('❌ MongoDB error:', err.message));

// ─── View engine ───
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Middleware ───
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Support PUT/DELETE via ?_method=PUT in forms
app.use(methodOverride('_method'));

// Sessions for admin auth
app.use(session({
    secret: process.env.SESSION_SECRET || 'uniworth-super-secret-dev-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24  // 24h
    }
}));

// ============================================
// ROUTES
// ============================================

app.get('/', (req, res) => {
    res.render('index', { pageTitle: "Uniworth - Premium Men's Fashion" });
});

app.use('/products', productsRouter);
app.use('/admin', adminRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).send(`
        <div style="text-align:center; padding:80px; font-family:Arial;">
            <h1 style="font-size:60px; margin:0;">404</h1>
            <p style="color:#666; margin:20px 0;">Page Not Found</p>
            <a href="/" style="color:#1a1a1a; text-decoration:underline;">← Go Back Home</a>
        </div>
    `);
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).send(`
        <div style="text-align:center; padding:80px; font-family:Arial;">
            <h1>Error</h1>
            <p style="color:#c0392b;">${err.message}</p>
            <a href="/" style="color:#1a1a1a;">← Home</a>
        </div>
    `);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📦 Products: http://localhost:${PORT}/products`);
    console.log(`🔐 Admin: http://localhost:${PORT}/admin/login`);
});
