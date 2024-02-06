//C:\next-news-project\backend\routes\articles.js
const express = require('express');
const Article = require('../models/article');
const upload = require('../multerConfig'); // Importação correta da configuração do multer
const router = express.Router();

// Não é necessário reconfigurar o AWS SDK aqui, já que isso é feito dentro de `../multerConfig`

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

// POST a new article com upload de imagens para o S3
router.post('/', upload.array('images'), async (req, res) => {
  const imagesUrls = req.files.map(file => file.location); // Assume `location` é a URL da imagem no S3

  const article = new Article({
    title: req.body.title,
    content: req.body.content,
    slug: req.body.slug,
    category: req.body.category,
    images: imagesUrls,
    publishDate: new Date().toISOString()
  });

  try {
    const newArticle = await article.save();
    res.status(201).json(newArticle);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// DELETE a specific article by slug
router.delete('/:slug', async (req, res) => {
  const slug = req.params.slug;
  try {
    const deletedArticle = await Article.findOneAndDelete({ slug });
    if (!deletedArticle) {
      return res.status(404).json({ message: 'Artigo não encontrado para exclusão.' });
    }
    res.status(200).json({ message: 'Artigo excluído com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno do servidor ao excluir o artigo.' });
  }
});

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
