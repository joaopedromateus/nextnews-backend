// routes/auth.js
// Importações necessárias para o funcionamento do router.
const express = require('express'); // Importação do Express para criação de rotas.
const jwt = require('jsonwebtoken'); // Importação do JWT para autenticação.
const bcrypt = require('bcrypt'); // Importação do Bcrypt para hashing de senhas.
const User = require('../models/User'); // Importação do modelo de usuário.
const router = express.Router(); // Criação do router para as rotas.

// Endpoint para registro de um novo usuário.
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Verifica se o usuário já existe no banco de dados.
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Usuário já existe');
    }

    // Cria um novo usuário com os dados fornecidos.
    const user = new User({ username, password });
    await user.save();

    // Retorna uma mensagem de sucesso após a criação do usuário.
    res.status(201).send('Usuário criado com sucesso');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao criar usuário');
  }
});

// Rota de login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Busca o usuário no banco de dados pelo nome de usuário.
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send('Usuário não encontrado');
    }

    // Verifica se a senha fornecida corresponde à senha armazenada no banco de dados.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Senha incorreta');
    }

    // Verifica se a variável de ambiente JWT_SECRET está definida.
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não está definido');
      return res.status(500).send('Erro no servidor');
    }

    // Gerar um token JWT com o ID do usuário e definindo um tempo de expiração.
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Login bem-sucedido');

    // Retorna o token JWT como resposta.
    res.json({ token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;
