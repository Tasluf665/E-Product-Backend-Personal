// Load express module
const express = require('express');
const app = express();
const port = process.env.PORT || 8000;

// Define a route to handle GET requests to the home page
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
