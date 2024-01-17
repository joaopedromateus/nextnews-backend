//delete.js
const express = require('express');
const router = express.Router();
const Article = require('../models/article');

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
