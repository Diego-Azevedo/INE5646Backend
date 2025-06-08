// import necessary modules
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Credenciais do MongoDB
const dbuser = process.env.DB_USER;
const dbpassword = process.env.DB_PASS;

// conexão com o MongoDB
mongoose
  .connect(`mongodb+srv://${dbuser}:${dbpassword}@jsonconvertdb.k4m8rb0.mongodb.net/?retryWrites=true&w=majority&appName=jsonConvertDb`)
  .then(() => {
    app.listen(3000)
    console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Models
const User = require('./models/User');

// Open Route - Public Route
app.get('/', (req, res) => {
  console.log('chamou');
  res.status(200).json({ message: 'Hello World!' });
})

// Private Route
app.get('/user/:id', checkToken, async (req, res) => {
  const id = req.params.id;

  // Check if the user exists
  const user = await User.findById(id, '-password'); // Exclude password from response
  // console.log('User found:', user);
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  res.status(200).json({ user });
});

function checkToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Acesso negado!' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido!' });
  }

  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ message: 'Token inválido!' });
  }
}


// Register Route
app.post('/auth/register', async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;

  if(!name || !email || !password || !confirmpassword) {
    return res.status(422).json({ message: 'Preencha todos os campos!' });
  }

  if (password !== confirmpassword) {
    return res.status(422).json({ message: 'As senhas não conferem!' });
  }

  const userExists = await User.findOne({ email: email });
  if (userExists) {
    return res.status(422).json({ message: 'E-mail já cadastrado!' });
  }

  // Hash the password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const user = new User({
    name,
    email,
    password: passwordHash,
  });

  try {
    await user.save();
    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Erro ao criar usuário.' });
  }
})

// Login route
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(422).json({ message: 'O nome e a senha são obrigatórios!' });
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    console.log('Usuário não encontrado');
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }

  // checkpassword
  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    console.log('Senha inválida');
    return res.status(422).json({ message: 'Senha inválida' });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret,
    );
    console.log('Usuário logado com sucesso');
    return res.status(200).json({ message: 'Usuário logado com sucesso', token });

  } catch(error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Erro ao fazer login.' });
  }
})
