const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // ✅ Import cors
const bodyParser = require('body-parser');
const usernameRoutes = require('./routes/usernames');
require('dotenv').config();

const app = express();
const PORT = 3000;

// ✅ Enable CORS for all routes
app.use(cors());

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/usernames', usernameRoutes);
const scrapeRoutes = require('./routes/scrapeRoutes');
app.use('/api/scrape', scrapeRoutes);
const processedRedgifsScrapeRoutes = require('./routes/processedRedgifsScrpeRoutes')
app.use('/api/scrape', processedRedgifsScrapeRoutes);


// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/zidit', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
