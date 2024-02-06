const multer = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const path = require('path');

// Atualiza a configuração do AWS SDK para usar as credenciais e a região especificada
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Chave de acesso ID fornecida via variáveis de ambiente
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Chave de acesso secreta fornecida via variáveis de ambiente
  region: 'sa-east-1', // Define a região do S3 para São Paulo
});

// Cria uma instância do S3 para interagir com o serviço
const s3 = new AWS.S3();

// Configura o multer para usar o armazenamento do S3
const upload = multer({
  storage: multerS3({
    s3, // Passa a instância do S3
    bucket: 'nextnewsproject', // Define o nome do bucket
    acl: 'public-read', // Define as permissões de acesso aos arquivos como públicas
    contentType: multerS3.AUTO_CONTENT_TYPE, // Permite que o tipo de conteúdo seja definido automaticamente
    key: function (req, file, cb) {
      // Cria um nome de arquivo único para evitar sobreposições
      const fileExtension = path.extname(file.originalname); // Extrai a extensão do arquivo original
      const fileName = path.basename(file.originalname, fileExtension); // Extrai o nome do arquivo sem a extensão
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Cria um sufixo único
      cb(null, `news-images/${fileName}-${uniqueSuffix}${fileExtension}`); // Combina tudo para formar o nome final do arquivo
    },
  }),
});

module.exports = upload;
