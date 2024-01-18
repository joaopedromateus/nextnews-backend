//backend/models/article.js
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  slug: String,
  images: [String],
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;