// ============================================
// routes/admin/index.js — Admin Panel Routes
// CRUD operations for products + dashboard
// ============================================

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const Product = require('../../models/Product');
const upload = require('../../middleware/upload');
const { requireAdmin } = require('../../middleware/auth');

// ─── Hardcoded credentials (for assignment demo only) ───
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

// ============================================
// AUTH ROUTES
// ============================================

// GET /admin/login — show login form
router.get('/login', (req, res) => {
    if (req.session.isAdmin) return res.redirect('/admin');
    res.render('admin/login', {
        pageTitle: 'Admin Login - Uniworth',
        error: null
    });
});

// POST /admin/login — process login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        req.session.isAdmin = true;
        req.session.username = username;
        return res.redirect('/admin');
    }
    res.render('admin/login', {
        pageTitle: 'Admin Login - Uniworth',
        error: 'Invalid username or password'
    });
});

// GET /admin/logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/admin/login'));
});

// ============================================
// PROTECTED ROUTES (require admin login)
// ============================================

// GET /admin — Dashboard with summary table
router.get('/', requireAdmin, async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });

        // Stats for dashboard
        const totalProducts = products.length;
        const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
        const outOfStock = products.filter(p => p.stock === 0).length;
        const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length;
        const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

        res.render('admin/dashboard', {
            pageTitle: 'Admin Dashboard - Uniworth',
            products,
            stats: { totalProducts, totalStock, outOfStock, lowStock, totalValue },
            success: req.query.success || null,
            error: req.query.error || null
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Error: ' + error.message);
    }
});

// ============================================
// CREATE
// ============================================

// GET /admin/products/new — show create form
router.get('/products/new', requireAdmin, (req, res) => {
    res.render('admin/product-form', {
        pageTitle: 'Add New Product - Admin',
        product: null,
        formAction: '/admin/products',
        formMethod: 'POST',
        isEdit: false,
        errors: []
    });
});

// POST /admin/products — create new product
router.post('/products', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, price, category, rating, stock, description } = req.body;
        const errors = [];

        // ─── Server-side validation ───
        if (!name || !name.trim()) errors.push('Name is required');
        if (!price || isNaN(price) || price < 0) errors.push('Valid price is required');
        if (!category) errors.push('Category is required');
        if (!stock || isNaN(stock) || stock < 0) errors.push('Valid stock is required');

        if (errors.length > 0) {
            // Delete uploaded file if validation failed
            if (req.file) fs.unlinkSync(req.file.path);
            return res.render('admin/product-form', {
                pageTitle: 'Add New Product - Admin',
                product: req.body,
                formAction: '/admin/products',
                formMethod: 'POST',
                isEdit: false,
                errors
            });
        }

        // Determine image path
        const imagePath = req.file
            ? `/uploads/${req.file.filename}`
            : '/asset/prod1.webp';  // fallback

        await Product.create({
            name: name.trim(),
            price: parseFloat(price),
            category,
            rating: rating ? parseFloat(rating) : 0,
            stock: parseInt(stock),
            description: description || '',
            image: imagePath
        });

        res.redirect('/admin?success=Product created successfully');
    } catch (error) {
        console.error('Create error:', error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.redirect('/admin?error=' + encodeURIComponent(error.message));
    }
});

// ============================================
// UPDATE
// ============================================

// GET /admin/products/:id/edit — show edit form
router.get('/products/:id/edit', requireAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.redirect('/admin?error=Product not found');

        res.render('admin/product-form', {
            pageTitle: `Edit ${product.name} - Admin`,
            product,
            formAction: `/admin/products/${product._id}?_method=PUT`,
            formMethod: 'POST',
            isEdit: true,
            errors: []
        });
    } catch (error) {
        res.redirect('/admin?error=' + encodeURIComponent(error.message));
    }
});

// PUT /admin/products/:id — update product
router.put('/products/:id', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, price, category, rating, stock, description } = req.body;
        const errors = [];

        if (!name || !name.trim()) errors.push('Name is required');
        if (!price || isNaN(price) || price < 0) errors.push('Valid price is required');
        if (!category) errors.push('Category is required');
        if (!stock || isNaN(stock) || stock < 0) errors.push('Valid stock is required');

        const existingProduct = await Product.findById(req.params.id);
        if (!existingProduct) return res.redirect('/admin?error=Product not found');

        if (errors.length > 0) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.render('admin/product-form', {
                pageTitle: 'Edit Product - Admin',
                product: { ...req.body, _id: req.params.id, image: existingProduct.image },
                formAction: `/admin/products/${req.params.id}?_method=PUT`,
                formMethod: 'POST',
                isEdit: true,
                errors
            });
        }

        const updateData = {
            name: name.trim(),
            price: parseFloat(price),
            category,
            rating: rating ? parseFloat(rating) : 0,
            stock: parseInt(stock),
            description: description || ''
        };

        // If a new image was uploaded, replace path & delete old uploaded file
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;

            // Delete old uploaded image (only if it was in /uploads, not /asset)
            if (existingProduct.image && existingProduct.image.startsWith('/uploads/')) {
                const oldPath = path.join(__dirname, '..', '..', 'public', existingProduct.image);
                if (fs.existsSync(oldPath)) {
                    try { fs.unlinkSync(oldPath); } catch (e) { console.warn('Old image cleanup failed:', e.message); }
                }
            }
        }

        await Product.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/admin?success=Product updated successfully');
    } catch (error) {
        console.error('Update error:', error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.redirect('/admin?error=' + encodeURIComponent(error.message));
    }
});

// ============================================
// DELETE
// ============================================

// DELETE /admin/products/:id — delete product
router.delete('/products/:id', requireAdmin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.redirect('/admin?error=Product not found');

        // Delete associated uploaded image
        if (product.image && product.image.startsWith('/uploads/')) {
            const imgPath = path.join(__dirname, '..', '..', 'public', product.image);
            if (fs.existsSync(imgPath)) {
                try { fs.unlinkSync(imgPath); } catch (e) { console.warn('Image cleanup:', e.message); }
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        res.redirect('/admin?success=Product deleted successfully');
    } catch (error) {
        console.error('Delete error:', error);
        res.redirect('/admin?error=' + encodeURIComponent(error.message));
    }
});

module.exports = router;
