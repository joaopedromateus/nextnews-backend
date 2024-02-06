//C:\next-news-project\backend\server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');

// Modelos e rotas
const Article = require('./models/article');
const articleRouter = require('./routes/articles');
const authRouter = require('./routes/auth');
const deleteRouter = require('./routes/delete');
const authenticateToken = require('./routes/authMiddleware');
const path = require('path');
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");



const app = express();

// Configuração do Multer para uploads de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Certifique-se de que a pasta 'uploads' exista
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.use(cors({
  origin: 'https://portaldenoticiasnext.vercel.app' // Permitir requisições do seu domínio frontend
}));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Servir uploads de arquivos estáticos

// Conexão com o MongoDB
mongoose.connect('mongodb+srv://testedb:batata123@cluster0.hcqoubl.mongodb.net/myDatabaseName?retryWrites=true&w=majority')
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.error('MongoDB connection error:', err));

// Rotas públicas (sem autenticação)
app.use('/api/articles', articleRouter); // Rota para obter artigos



// Rota para servir imagens do S3 com chave dinâmica
app.get('/s3-images/:key', async (req, res) => {
  const key = req.params.key;
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  const getObjectParams = {
    Bucket: 'nextnewsproject', // Substitua pelo nome do seu bucket
    Key: key // A chave (Key) é dinâmica com base na notícia
  };

  try {
    const { Body } = await s3.send(new GetObjectCommand(getObjectParams));
    res.setHeader('Content-Type', 'image/jpeg'); // Defina o tipo de conteúdo apropriado
    Body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(404).send('Imagem não encontrada');
  }
});


// Rotas protegidas (com autenticação)
app.use('/api/admin/articles', authenticateToken, articleRouter); // Rota para criar/deletar/editar artigos
app.use('/api/admin/delete', authenticateToken, deleteRouter); // Rota para ações administrativas adicionais


// Rota para páginas individuais de notícias
app.get('/article/:slug', async (req, res) => {
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

// Rotas de autenticação
app.use('/api/auth', authRouter);

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
