// ============================================
// models/Product.js — Mongoose Product Schema
// ============================================

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: [
            'Polo Shirts',
            'Casual Shirts',
            'Ethnic',
            'Blazers',
            'Co-ord Sets',
            'Gurkha Pants',
            'Accessories'
        ]
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    image: {
        type: String,
        default: '/asset/prod1.webp'
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true  // adds createdAt and updatedAt
});

module.exports = mongoose.model('Product', productSchema);
