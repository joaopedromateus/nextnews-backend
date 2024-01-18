//backend/server.js

const express = require('express');
const Article = require('../backend/models/article')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const articleRouter = require('./routes/articles');
const cors = require('cors');
const deleteRouter = require('./routes/delete');

const app = express();
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve the static files from the 'client' directory
app.use(express.static(path.join(__dirname, 'client')));


// MongoDB Connection
mongoose.connect('mongodb+srv://testedb:batata123@cluster0.hcqoubl.mongodb.net/myDatabaseName?retryWrites=true&w=majority')
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error('MongoDB connection error:', err));


// API Routes
app.use('/api/articles', articleRouter);
app.use('/api/articles/delete', deleteRouter);

// Rota para páginas individuais de notícias
app.get('/article/:slug', async (req, res) => {
  const slug = req.params.slug;

  try {
    const article = await Article.findOne({ slug });

    if (!article) {
      return res.status(404).json({ message: 'Notícia não encontrada' });
    }

    // Retorna os detalhes da notícia como JSON
    res.json(article);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});


// Serve the frontend application for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});