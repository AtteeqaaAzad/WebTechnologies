// routes/admin/index.js
// Admin panel - only admins can access
// Handles: dashboard, create, edit, update, delete products

var express    = require('express');
var router     = express.Router();
var fs         = require('fs');
var path       = require('path');
var Product    = require('../../models/Product');
var upload     = require('../../middleware/upload');
var authHelper = require('../../middleware/auth');

// Protect ALL admin routes - must be admin
router.use(authHelper.isAdmin);

// ─────────────────────────────────────────
// DASHBOARD - Show all products
// ─────────────────────────────────────────

router.get('/', function(req, res) {
    Product.find().sort({ createdAt: -1 }).then(function(products) {

        // Calculate some stats
        var totalProducts = products.length;
        var totalStock    = 0;
        var outOfStock    = 0;
        var lowStock      = 0;
        var totalValue    = 0;

        products.forEach(function(p) {
            totalStock += p.stock;
            totalValue += p.stock * p.price;
            if (p.stock === 0) outOfStock++;
            if (p.stock > 0 && p.stock < 10) lowStock++;
        });

        res.render('admin/dashboard', {
            pageTitle: 'Admin Dashboard - Uniworth',
            products:  products,
            stats: {
                totalProducts: totalProducts,
                totalStock:    totalStock,
                outOfStock:    outOfStock,
                lowStock:      lowStock,
                totalValue:    totalValue
            }
        });
    }).catch(function(err) {
        req.flash('error', 'Could not load dashboard.');
        res.redirect('/');
    });
});

// ─────────────────────────────────────────
// CREATE - Add new product
// ─────────────────────────────────────────

// Show the add product form
router.get('/products/new', function(req, res) {
    res.render('admin/product-form', {
        pageTitle:  'Add Product - Admin',
        product:    null,
        formAction: '/admin/products',
        isEdit:     false,
        errors:     []
    });
});

// Save the new product
router.post('/products', upload.single('image'), function(req, res) {
    var name        = req.body.name;
    var price       = req.body.price;
    var category    = req.body.category;
    var stock       = req.body.stock;
    var rating      = req.body.rating || 0;
    var description = req.body.description || '';
    var errors      = [];

    // Validation
    if (!name)     errors.push('Name is required');
    if (!price)    errors.push('Price is required');
    if (!category) errors.push('Category is required');
    if (!stock)    errors.push('Stock is required');

    if (errors.length > 0) {
        if (req.file) fs.unlinkSync(req.file.path);  // delete uploaded file
        return res.render('admin/product-form', {
            pageTitle:  'Add Product - Admin',
            product:    req.body,
            formAction: '/admin/products',
            isEdit:     false,
            errors:     errors
        });
    }

    // Use uploaded image or default
    var imagePath = '/asset/prod1.webp';
    if (req.file) {
        imagePath = '/uploads/' + req.file.filename;
    }

    var newProduct = new Product({
        name:        name,
        price:       parseFloat(price),
        category:    category,
        stock:       parseInt(stock),
        rating:      parseFloat(rating),
        description: description,
        image:       imagePath
    });

    newProduct.save().then(function() {
        req.flash('success', 'Product created successfully!');
        res.redirect('/admin');
    }).catch(function(err) {
        req.flash('error', 'Could not create product: ' + err.message);
        res.redirect('/admin');
    });
});

// ─────────────────────────────────────────
// UPDATE - Edit existing product
// ─────────────────────────────────────────

// Show the edit form (pre-filled with existing data)
router.get('/products/:id/edit', function(req, res) {
    Product.findById(req.params.id).then(function(product) {
        if (!product) {
            req.flash('error', 'Product not found.');
            return res.redirect('/admin');
        }
        res.render('admin/product-form', {
            pageTitle:  'Edit Product - Admin',
            product:    product,
            formAction: '/admin/products/' + product._id + '?_method=PUT',
            isEdit:     true,
            errors:     []
        });
    });
});

// Save the edited product
router.put('/products/:id', upload.single('image'), function(req, res) {
    var name        = req.body.name;
    var price       = req.body.price;
    var category    = req.body.category;
    var stock       = req.body.stock;
    var rating      = req.body.rating || 0;
    var description = req.body.description || '';
    var errors      = [];

    if (!name)     errors.push('Name is required');
    if (!price)    errors.push('Price is required');
    if (!category) errors.push('Category is required');
    if (!stock)    errors.push('Stock is required');

    if (errors.length > 0) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.render('admin/product-form', {
            pageTitle:  'Edit Product - Admin',
            product:    { _id: req.params.id, ...req.body },
            formAction: '/admin/products/' + req.params.id + '?_method=PUT',
            isEdit:     true,
            errors:     errors
        });
    }

    Product.findById(req.params.id).then(function(product) {
        if (!product) {
            req.flash('error', 'Product not found.');
            return res.redirect('/admin');
        }

        // Update all fields
        product.name        = name;
        product.price       = parseFloat(price);
        product.category    = category;
        product.stock       = parseInt(stock);
        product.rating      = parseFloat(rating);
        product.description = description;

        // If a new image was uploaded, update it
        if (req.file) {
            // Delete old uploaded image if it exists
            if (product.image && product.image.startsWith('/uploads/')) {
                var oldImagePath = path.join(__dirname, '../../public', product.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            product.image = '/uploads/' + req.file.filename;
        }

        product.save().then(function() {
            req.flash('success', 'Product updated successfully!');
            res.redirect('/admin');
        });
    }).catch(function(err) {
        req.flash('error', 'Could not update product: ' + err.message);
        res.redirect('/admin');
    });
});

// ─────────────────────────────────────────
// DELETE - Remove a product
// ─────────────────────────────────────────

router.delete('/products/:id', function(req, res) {
    Product.findById(req.params.id).then(function(product) {
        if (!product) {
            req.flash('error', 'Product not found.');
            return res.redirect('/admin');
        }

        // Delete the image file from uploads folder
        if (product.image && product.image.startsWith('/uploads/')) {
            var imagePath = path.join(__dirname, '../../public', product.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        Product.findByIdAndDelete(req.params.id).then(function() {
            req.flash('success', 'Product deleted successfully!');
            res.redirect('/admin');
        });
    }).catch(function(err) {
        req.flash('error', 'Could not delete product: ' + err.message);
        res.redirect('/admin');
    });
});

module.exports = router;
