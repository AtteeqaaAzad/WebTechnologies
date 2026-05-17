// ============================================
// routes/products.js — Products Route Handler
// Handles: pagination, search, category & price filtering
// ============================================

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
    try {
        // ─── Read query parameters ───
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = 8;  // Assignment requirement: 8 products per page
        const skip = (page - 1) * limit;

        const search = req.query.search ? req.query.search.trim() : '';
        const category = req.query.category || '';
        const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : null;
        const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : null;
        const sort = req.query.sort || 'newest';

        // ─── Build MongoDB query ───
        const query = {};

        // Search by name (case-insensitive partial match)
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by price range
        if (minPrice !== null || maxPrice !== null) {
            query.price = {};
            if (minPrice !== null) query.price.$gte = minPrice;
            if (maxPrice !== null) query.price.$lte = maxPrice;
        }

        // ─── Sort options ───
        let sortOption = {};
        switch (sort) {
            case 'price-low':   sortOption = { price: 1 }; break;
            case 'price-high':  sortOption = { price: -1 }; break;
            case 'rating':      sortOption = { rating: -1 }; break;
            case 'name':        sortOption = { name: 1 }; break;
            case 'newest':
            default:            sortOption = { createdAt: -1 }; break;
        }

        // ─── Execute queries in parallel ───
        const [products, totalProducts, categories] = await Promise.all([
            Product.find(query).sort(sortOption).skip(skip).limit(limit),
            Product.countDocuments(query),
            Product.distinct('category')  // get all unique categories for sidebar
        ]);

        const totalPages = Math.ceil(totalProducts / limit) || 1;

        // ─── Render template ───
        res.render('products', {
            pageTitle: 'All Products - Uniworth',
            products,
            categories,
            // Pagination
            currentPage: page,
            totalPages,
            totalProducts,
            limit,
            // Active filters (for re-populating form)
            filters: {
                search,
                category,
                minPrice: req.query.minPrice || '',
                maxPrice: req.query.maxPrice || '',
                sort
            }
        });
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        res.status(500).send('Server error: ' + error.message);
    }
});

module.exports = router;
