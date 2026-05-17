// models/User.js
// Defines what a user looks like in the database
// Passwords are hashed with bcrypt before saving

var mongoose = require('mongoose');
var bcrypt   = require('bcryptjs');

var userSchema = new mongoose.Schema({
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:     { type: String, default: 'customer' }  // 'customer' or 'admin'
}, {
    timestamps: true
});

// Before saving a user, hash their password
userSchema.pre('save', function(next) {
    var user = this;

    // Only hash if password was changed
    if (!user.isModified('password')) {
        return next();
    }

    // Generate salt and hash the password
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            user.password = hash;  // replace plain password with hash
            next();
        });
    });
});

// Method to check if a password matches
userSchema.methods.checkPassword = function(typedPassword, callback) {
    bcrypt.compare(typedPassword, this.password, function(err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

module.exports = mongoose.model('User', userSchema);
