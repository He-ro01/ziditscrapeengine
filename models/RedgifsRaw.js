const mongoose = require('mongoose');

const redgifsRawSchema = new mongoose.Schema({}, { strict: false }); // Store full raw Reddit post

module.exports = mongoose.model('RedgifsRaw', redgifsRawSchema);
