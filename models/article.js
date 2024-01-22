//backend/models/article.js
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  slug: String,
  images: [String],
  publishDate: {
    type: Date,
    default: Date.now, // Define a data de publicação como a data atual por padrão
  },
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;