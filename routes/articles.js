//C:\next-news-project\backend\routes\articles.js
// Importações necessárias para o funcionamento do router.
const express = require('express'); // Importação do Express para criar rotas.
const Article = require('../models/article'); // Importação do modelo de artigo.
const upload = require('../multerConfig'); // Importação do Multer para upload de arquivos.
const router = express.Router(); // Criação do router para as rotas.

// Endpoint para buscar um artigo específico pelo slug.
router.get('/:slug', async (req, res) => {
  try {
    // Procura um artigo no banco de dados pelo slug fornecido.
    const article = await Article.findOne({ slug: req.params.slug });
    if (article) {
      res.json(article);
    } else {
      res.status(404).json({ message: 'Artigo não encontrado.' });
    }
  } catch (error) {
    // Se ocorrer um erro durante a busca, retorna um erro 500.
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar o artigo.' });
  }
});

// Endpoint para buscar todos os artigos.
router.get('/', async (req, res) => {
  try {
    // Busca todos os artigos no banco de dados.
    const articles = await Article.find({});
    // Envio dos artigos encontrados como resposta.
    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar os artigos.' });
  }
});

// Endpoint para criar um novo artigo com upload de imagens para o S3.
router.post('/', upload.array('images'), async (req, res) => {
  // Captura URLs das imagens armazenadas no S3.
  const imagesUrls = req.files.map(file => file.location);

  // Criação de um novo objeto de artigo com os dados recebidos.
  const newArticleData = {
    title: req.body.title,
    content: req.body.content,
    slug: req.body.slug,
    category: req.body.category,
    images: imagesUrls,
    publishDate: new Date().toISOString()
  };

  try {
    // Cria um novo documento de artigo no banco de dados.
    const newArticle = new Article(newArticleData);
    await newArticle.save();
    // Retorna o novo artigo criado como resposta.
    res.status(201).json(newArticle);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Erro ao criar o artigo.' });
  }
});

// Endpoint para excluir um artigo específico pelo slug.
router.delete('/:slug', async (req, res) => {
  try {
    // Busca e deleta o artigo no banco de dados pelo slug fornecido.
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

// Rota para deletar todos os artigos
router.delete('/all', async (req, res) => {
  try {
    await Article.deleteMany({});
    res.status(200).json({ message: 'Todos os artigos foram excluídos com sucesso.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro interno do servidor ao excluir os artigos.' });
  }
});

module.exports = router;
