const mongoose = require('mongoose');

const processedSchema = new mongoose.Schema({
  tags: [String],
  likes: String,
  views: String,
  date: String,
  username: String,
  description: String,
  videoUrl: String,
  rawUrl: { type: String, unique: true },
  scrapedAt: Date,
  imageUrl: String,
});

module.exports = (connection) =>
  connection.model('ProcessedRedgifs', processedSchema);
