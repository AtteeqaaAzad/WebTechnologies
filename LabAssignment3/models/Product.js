// models/Product.js
// Defines what a product looks like in the database

var mongoose = require('mongoose');

var productSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    price:       { type: Number, required: true },
    category:    { type: String, required: true },
    rating:      { type: Number, default: 0 },
    stock:       { type: Number, required: true, default: 0 },
    image:       { type: String, default: '/asset/prod1.webp' },
    description: { type: String, default: '' }
}, {
    timestamps: true  // auto adds createdAt and updatedAt
});

module.exports = mongoose.model('Product', productSchema);
