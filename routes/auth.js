// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).send('Usuário já existe');
    }

    const user = new User({ username, password });
    await user.save();

    // Aqui, você também pode gerar um token JWT e enviá-lo de volta
    // const token = jwt.sign({ userId: user._id }, 'seu_jwt_secret');

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

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send('Usuário não encontrado');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Senha incorreta');
    }

    // Certifique-se de que a variável JWT_SECRET está definida
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não está definido');
      return res.status(500).send('Erro no servidor');
    }

    // Gerar um token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Login bem-sucedido'); // Adicione esta linha para exibir a mensagem no console

    res.json({ token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).send('Erro no servidor');
  }
});

module.exports = router;