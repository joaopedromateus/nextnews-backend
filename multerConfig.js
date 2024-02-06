const multer = require('multer');
const { S3Client } = require("@aws-sdk/client-s3");
const multerS3 = require('multer-s3');
const path = require('path');

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
    s3: s3Client,
    bucket: 'nextnewsproject',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const extension = path.extname(file.originalname);
      const basename = path.basename(file.originalname, extension);
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      cb(null, `news-images/${basename}-${uniqueSuffix}${extension}`);
    },
  }),
});

module.exports = upload;
