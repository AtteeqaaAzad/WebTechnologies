
const express = require('express');

const server = express();


// Route for the Home Page: http://localhost:3000/
server.get('/', (req, res) => {
    // Step 4: Send a response back to the browser
    res.send('Home Page');
});

// Route for the Contact Us page: http://localhost:3000/contact-us
server.get('/contact-us', (req, res) => {
    res.send('Contact Us');
});

// Route for About page: http://localhost:3000/about
server.get('/about', (req, res) => {
    res.send('About Us');
});


const PORT = 3000;

server.listen(PORT, () => {
    console.log(`Server Started at http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server.');
});
