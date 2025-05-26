// models/Image.js
const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({}, { strict: false }); // Accepts all fields
module.exports = mongoose.model('Image', imageSchema);