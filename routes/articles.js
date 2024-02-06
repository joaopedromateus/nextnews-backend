//C:\next-news-project\backend\routes\articles.js
const express = require('express');
const Article = require('../models/article');
const multer = require('multer'); // Importe o módulo multer corretamente
const router = express.Router();
const AWS = require('aws-sdk');


// Configurar o SDK AWS
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION, // Substitua pela região do seu bucket
});


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

// POST a new article with image upload to S3
const upload = multer(); // Use multer para processar a imagem, não é mais necessário o multerConfig
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const imageBuffer = req.file.buffer;
    const imageName = `${Date.now()}_${req.file.originalname}`;

    const params = {
      Bucket: 'seu-nome-de-bucket',
      Key: `caminho/para/a/imagem/${imageName}`, // Caminho e nome da imagem no bucket
      Body: imageBuffer,
    };

    await s3.upload(params).promise(); // Faz upload da imagem para o S3

    const article = new Article({
      title: req.body.title,
      content: req.body.content,
      slug: req.body.slug,
      category: req.body.category,
      images: [`https://seu-nome-de-bucket.s3.sua-regiao-do-bucket.amazonaws.com/${params.Key}`], // URL da imagem no S3
      publishDate: new Date().toISOString(),
    });

    const newArticle = await article.save();
    res.status(201).json(newArticle);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Additional routes for PUT and DELETE...

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
