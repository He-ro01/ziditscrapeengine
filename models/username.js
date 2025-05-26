const mongoose = require('mongoose');

const usernameSchema = new mongoose.Schema({
  username: { type: String, unique: true }
});

module.exports = mongoose.model('Username', usernameSchema);
