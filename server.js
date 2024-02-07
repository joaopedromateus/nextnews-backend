//C:\next-news-project\backend\server.js
require('dotenv').config(); // Importa e configura as variáveis de ambiente do arquivo .env
const express = require('express'); // Importa o framework Express
const mongoose = require('mongoose'); // Importa o ODM Mongoose para conexão com o MongoDB
const bodyParser = require('body-parser'); // Middleware para análise de corpos de requisição
const cors = require('cors'); // Middleware para habilitar requisições cross-origin
const multer = require('multer'); // Middleware para manipulação de uploads de arquivos
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3"); // Importa o cliente S3 do AWS SDK
const path = require('path'); // Importa o módulo path para manipulação de caminhos de arquivos

// Importa os modelos e rotas
const Article = require('./models/article');
const articleRouter = require('./routes/articles');
const authRouter = require('./routes/auth');
const authenticateToken = require('./routes/authMiddleware');

const app = express(); // Cria uma instância do aplicativo Express

// Configuração do Multer para uploads de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Define o diretório de destino para os uploads de arquivos
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Define o nome do arquivo
  }
});
const upload = multer({ storage: storage }); // Configura o middleware Multer com a estratégia de armazenamento

app.use(cors({
  origin: 'https://portaldenoticiasnext.vercel.app' // Define as origens permitidas para requisições cross-origin
}));
app.use(bodyParser.json()); // Configura o middleware bodyParser para análise de corpos de requisição JSON
app.use('/uploads', express.static('uploads')); // Define o diretório 'uploads' como estático para servir arquivos

// Conexão com o MongoDB usando as credenciais do arquivo .env
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...')) // Log de sucesso na conexão com o MongoDB
  .catch(err => console.error('MongoDB connection error:', err)); // Log de erro na conexão com o MongoDB

// Rota para servir imagens do S3 com chave dinâmica
app.get('/s3-images/:key', async (req, res) => {
  const key = req.params.key; // Obtém a chave dinâmica dos parâmetros da requisição
  const s3 = new S3Client({ // Cria uma nova instância do cliente S3 com as credenciais do arquivo .env
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });

  const getObjectParams = { // Parâmetros para obter o objeto (imagem) do S3
    Bucket: 'nextnewsproject', // Nome do bucket
    Key: key // Chave do objeto (imagem)
  };

  try {
    const { Body } = await s3.send(new GetObjectCommand(getObjectParams)); // Obtém o corpo (conteúdo) da imagem do S3
    res.setHeader('Content-Type', 'image/jpeg'); // Define o tipo de conteúdo como imagem JPEG
    Body.pipe(res); // Envia o corpo (conteúdo) da imagem como resposta
  } catch (err) {
    console.error(err); // Log de erro caso a imagem não seja encontrada
    res.status(404).send('Imagem não encontrada'); // Retorna status 404 se a imagem não for encontrada
  }
});

// Rotas públicas (sem autenticação)
app.use('/api/articles', articleRouter); // Rota para obter artigos

// Rotas protegidas (com autenticação)
app.use('/api/admin/articles', authenticateToken, articleRouter); // Rota para criar/deletar/editar artigos
app.use('/api/admin/delete', authenticateToken, deleteRouter); // Rota para ações administrativas adicionais

// Rota para páginas individuais de notícias
app.get('/article/:slug', async (req, res) => {
  const slug = req.params.slug; // Obtém o slug dos parâmetros da requisição
  try {
    const article = await Article.findOne({ slug }); // Busca o artigo pelo slug no MongoDB
    if (!article) { // Se o artigo não for encontrado, retorna status 404 com uma mensagem JSON
      return res.status(404).json({ message: 'Notícia não encontrada' });
    }
    res.json(article); // Se o artigo for encontrado, retorna o artigo como JSON
  } catch (err) {
    console.error(err); // Log de erro caso ocorra um erro interno do servidor
    res.status(500).json({ message: 'Erro interno do servidor' }); // Retorna status 500 em caso de erro interno do servidor
  }
});

// Rotas de autenticação
app.use('/api/auth', authRouter);

// Iniciar o servidor na porta definida no arquivo .env ou na porta 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // Log de sucesso na inicialização do servidor
});
