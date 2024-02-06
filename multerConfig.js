//C: \next - news - project\backend\multerConfig.js
const multer = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const path = require('path');

// Configuração do AWS SDK com a região especificada para São Paulo
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'sa-east-1', // Região do S3 definida como São Paulo
});

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'nextnewsproject', // Nome do bucket sem o caminho específico
    acl: 'public-read', // Permissões do arquivo definidas como públicas para leitura
    contentType: multerS3.AUTO_CONTENT_TYPE, // Tipo de conteúdo definido automaticamente
    key: function (req, file, cb) {
      // Define o nome do arquivo dentro do bucket usando o caminho específico fornecido
      const extension = path.extname(file.originalname);
      // Adiciona o caminho 'news-images/' ao nome do arquivo para armazenar no diretório especificado
      cb(null, `news-images/${Date.now().toString()}${extension}`);
    },
  }),
});

module.exports = upload;
