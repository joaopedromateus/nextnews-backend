//articles.js
const express = require('express');
const Article = require('../models/article'); // assuming 'Article' model is exported from 'article.js'
const router = express.Router();

// GET all articles
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find();
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new article
router.post('/', async (req, res) => {
  const article = new Article({
    title: req.body.title,
    content: req.body.content,
    slug: req.body.slug,
    category: req.body.category,
    images: req.body.images // assuming images are sent as an array of URLs
  });

  try {
    const newArticle = await article.save();
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Additional routes for PUT and DELETE...

// DELETE all articles
router.delete('/', async (req, res) => {
  try {
    await Article.deleteMany({});
    res.status(200).json({ message: 'Todos os artigos foram excluídos com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro interno do servidor ao excluir os artigos.' });
  }
});


module.exports = router;
