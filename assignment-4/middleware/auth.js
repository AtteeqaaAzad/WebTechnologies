// ============================================
// middleware/auth.js — Simple Admin Auth
// ============================================

// Protect admin routes — redirect to login if not authenticated
const requireAdmin = (req, res, next) => {
    if (req.session && req.session.isAdmin) {
        return next();
    }
    return res.redirect('/admin/login');
};

module.exports = { requireAdmin };
