// routes/authMiddleware.js

const jwt = require('jsonwebtoken');  // Importação do JWT para autenticação.

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // Se não houver token, retorna um erro 401

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Se o token for inválido ou expirado, retorna um erro 403

    req.user = user;
    next(); // Se estiver tudo certo, prossegue para a próxima middleware/função
  });
}

module.exports = authenticateToken;
