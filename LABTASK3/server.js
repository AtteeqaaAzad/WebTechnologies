// ============================================
// Uniworth Express Application - server.js
// ============================================

// Step 1: Import required modules
const express = require('express');
const path = require('path');

// Step 2: Create the Express application
const app = express();

// ============================================
// Step 3: Configure Middleware
// ============================================

// Serve static files (CSS, JS, images) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Serve the asset folder so images load correctly
app.use('/asset', express.static(path.join(__dirname, 'asset')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Tell Express where to find our view/template files
app.set('views', path.join(__dirname, 'views'));

// ============================================
// Step 4: Define Routes
// ============================================

// Home Page — renders the main landing page
app.get('/', (req, res) => {
    res.render('index', {
        title: 'Uniworth - Premium Men\'s Fashion',
        cartCount: 0
    });
});

// About Page
app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About Us - Uniworth'
    });
});

// Contact Page
app.get('/contact', (req, res) => {
    res.render('contact', {
        title: 'Contact Us - Uniworth'
    });
});

// Shop Page
app.get('/shop', (req, res) => {
    res.render('shop', {
        title: 'Shop - Uniworth'
    });
});

// ============================================
// Step 5: 404 Handler — catch unknown routes
// ============================================
app.use((req, res) => {
    res.status(404).send(`
        <div style="text-align:center; font-family:Arial; padding:80px;">
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <a href="/" style="color:#1a1a1a; font-weight:bold;">← Back to Home</a>
        </div>
    `);
});

// ============================================
// Step 6: Start the Server
// ============================================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Uniworth server started at http://localhost:${PORT}`);
    console.log(`📄 Routes available:`);
    console.log(`   → http://localhost:${PORT}/          (Home)`);
    console.log(`   → http://localhost:${PORT}/about     (About)`);
    console.log(`   → http://localhost:${PORT}/contact   (Contact)`);
    console.log(`   → http://localhost:${PORT}/shop      (Shop)`);
    console.log(`\nPress Ctrl+C to stop the server.`);
});
