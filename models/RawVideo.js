
const mongoose = require('mongoose');
// models/RawVideo.js
const rawVideoSchema = new mongoose.Schema({}, { strict: false }); // Accepts all fields
module.exports = mongoose.model('RawVideo', rawVideoSchema);