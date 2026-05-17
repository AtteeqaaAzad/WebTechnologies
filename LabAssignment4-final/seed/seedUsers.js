// seed/seedUsers.js
// Creates default admin and customer accounts
// Run with: npm run seed:users

require('dotenv').config();
var mongoose = require('mongoose');
var User     = require('../models/User');

var DB = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uniworth';

mongoose.connect(DB).then(function() {
    console.log('Connected to MongoDB');

    // Clear existing users
    User.deleteMany({}).then(function() {
        console.log('Cleared existing users');

        // Create admin user
        var admin = new User({
            name:     'Admin User',
            email:    'admin@uniworth.com',
            password: 'admin123',
            role:     'admin'
        });

        admin.save().then(function() {
            console.log('Created admin: admin@uniworth.com / admin123');

            // Create customer user
            var customer = new User({
                name:     'John Customer',
                email:    'customer@uniworth.com',
                password: 'customer123',
                role:     'customer'
            });

            customer.save().then(function() {
                console.log('Created customer: customer@uniworth.com / customer123');
                console.log('Done!');
                mongoose.connection.close();
            });
        });
    });
}).catch(function(err) {
    console.log('Error: ' + err.message);
});
