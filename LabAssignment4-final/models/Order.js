// models/Order.js
// Defines what an order looks like in the database

var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items:       { type: Array, required: true },   // list of products ordered
    totalAmount: { type: Number, required: true },
    status:      { type: String, default: 'pending' },
    city:        { type: String, default: '' },
    street:      { type: String, default: '' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
