const mongoose = require('mongoose');

// Flexible schema: accepts any structure, but URL is expected
const redgifsRawSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('RedgifsRaw', redgifsRawSchema);
