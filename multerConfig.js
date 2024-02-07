//C:\next-news-project\backend\multerConfig.js
const multer = require('multer'); // Importação do Multer para manipulação de uploads de arquivos.
const { S3Client } = require("@aws-sdk/client-s3"); // Importação do cliente S3.
const multerS3 = require('multer-s3'); // Importação do Multer-S3 para armazenamento no S3.
const path = require('path'); // Importação do módulo 'path' para manipulação de caminhos de arquivos.

// Cria uma nova instância do cliente S3 com as configurações específicas
const s3Client = new S3Client({
  region: process.env.AWS_REGION, // Mudança para usar AWS_REGION
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Configuração do Multer para usar armazenamento S3
const upload = multer({
  storage: multerS3({
    s3: s3Client, // Cliente S3 configurado
    bucket: 'nextnewsproject', // Nome do bucket S3
    contentType: multerS3.AUTO_CONTENT_TYPE, // Tipo de conteúdo automático
    key: function (req, file, cb) {
      const extension = path.extname(file.originalname); // Obtém a extensão do arquivo
      const basename = path.basename(file.originalname, extension); // Obtém o nome do arquivo sem extensão
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`; // Sufixo único para evitar colisões de nome
      cb(null, `news-images/${basename}-${uniqueSuffix}${extension}`); // Chama a callback com o nome do arquivo no S3
    },
  }),
});

module.exports = upload; // Exportação do middleware de upload configurado para o S3.
