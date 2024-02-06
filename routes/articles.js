// Importações necessárias para o funcionamento do router.
const express = require('express');
const Article = require('../models/article');
// A configuração do Multer para upload já é tratada em multerConfig.
const upload = require('../multerConfig');
const router = express.Router();

// A reconfiguração do AWS SDK não é necessária, pois já é abordada em multerConfig.

// Endpoint para buscar um artigo específico pelo slug.
router.get('/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug });
    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ message: 'Artigo não encontrado.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar o artigo.' });
  }
});

// Endpoint para buscar todos os artigos.
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find({});
    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar os artigos.' });
  }
});

// Endpoint para criar um novo artigo com upload de imagens para o S3.
router.post('/', upload.array('images'), async (req, res) => {
  const imagesUrls = req.files.map(file => file.location); // Captura URLs das imagens armazenadas no S3.

  const newArticleData = {
    title: req.body.title,
    content: req.body.content,
    slug: req.body.slug,
    category: req.body.category,
    images: imagesUrls,
    publishDate: new Date().toISOString()
  };

  try {
    const newArticle = new Article(newArticleData);
    await newArticle.save();
    res.status(201).json(newArticle);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Erro ao criar o artigo.' });
  }
});

// Endpoint para excluir um artigo específico pelo slug.
router.delete('/:slug', async (req, res) => {
  try {
    const result = await Article.findOneAndDelete({ slug: req.params.slug });
    if (result) {
      res.status(200).json({ message: 'Artigo excluído com sucesso.' });
    } else {
      res.status(404).json({ message: 'Artigo não encontrado.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao excluir o artigo.' });
  }
});

// Endpoint para excluir todos os artigos.
router.delete('/', async (req, res) => {
  try {
    await Article.deleteMany({});
    res.status(200).json({ message: 'Todos os artigos foram excluídos com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao excluir os artigos.' });
  }
});

module.exports = router;
