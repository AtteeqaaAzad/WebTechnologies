// middleware/verifyToken.js
// Checks if the JWT token sent with API requests is valid

var jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
    // Get the Authorization header
    var authHeader = req.headers['authorization'];

    // Check if header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'No token provided. Add header: Authorization: Bearer <token>'
        });
    }

    // Get just the token part (remove "Bearer " from start)
    var token = authHeader.split(' ')[1];

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
        if (err) {
            return res.status(401).json({
                success: false,
                message: 'Token is invalid or expired. Please login again.'
            });
        }

        // Token is valid - attach user info to request
        req.user = decoded;
        next();
    });
}

module.exports = { verifyToken };
