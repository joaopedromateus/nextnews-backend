// backend/routes/articles.js
const express = require('express');
const Article = require('../models/article');
const upload = require('../multerConfig'); // Importar a configuração do multer
const router = express.Router();

// GET a specific article by slug
router.get('/:slug', async (req, res) => {
  const slug = req.params.slug;

  try {
    const article = await Article.findOne({ slug });

    if (!article) {
      return res.status(404).json({ message: 'Notícia não encontrada' });
    }

    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

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
router.post('/', upload.array('images'), async (req, res) => {
  const imagesPaths = req.files.map(file => file.path);

  const article = new Article({
    title: req.body.title,
    content: req.body.content,
    slug: req.body.slug,
    category: req.body.category,
    images: imagesPaths
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
