// import necessary modules
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Credentials MongoDB
const dbuser = process.env.DB_USER;
const dbpassword = process.env.DB_PASS;

// CORS
const cors = require('cors');
app.use(cors({
  origin: ['https://jsonconvert.org', 'https://www.jsonconvert.org', 'http://localhost:9000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Connect MongoDB
mongoose
  .connect(`mongodb+srv://${dbuser}:${dbpassword}@jsonconvertdb.k4m8rb0.mongodb.net/?retryWrites=true&w=majority&appName=jsonConvertDb`)
  .then(() => {
    app.listen(3000, '0.0.0.0', () => {
      console.log('MongoDB connected port 3000');
    });
    console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

// Models
const User = require('./models/User');

// Open Route - Public Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Hello World!' });
})

// Private Route
app.get('/user/:id', checkToken, async (req, res) => {
  const id = req.params.id;

  const user = await User.findById(id, '-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json({ user });
});

function checkToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied!' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    console.error('Token not provided on private route');
    return res.status(401).json({ message: 'Token not provided!' });
  }

  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ message: 'Invalid token!' });
  }
}


// Register Route
app.post('/auth/register', async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;

  if(!name || !email || !password || !confirmpassword) {
    return res.status(422).json({ message: 'Fill in all fields!' });
  }

  if (password !== confirmpassword) {
    return res.status(422).json({ message: 'Passwords dont match!' });
  }

  const userExists = await User.findOne({ email: email });

  if (userExists && userExists.active === false) {
    return res.status(422).json({ message: 'You cant use this email. Use another!' });
  }

  if (userExists) {
    return res.status(422).json({ message: 'Email already registered!' });
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    name,
    email,
    password: passwordHash,
  });

  try {
    await user.save();
    res.status(201).json({ message: 'Create user successfully!' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Create user error.' });
  }
})

// Login route
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(422).json({ message: 'Name and password are required!' });
  }

  const user = await User.findOne({ email: email });

  if (!user || user.active === false) {
    console.log('User not found -> ', email);
    return res.status(404).json({ message: 'User not found' });
  }

  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    console.log('Invalid password -> ', email);
    return res.status(422).json({ message: 'Invalid password' });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret,
    );
    console.log('User logged in successfully -> ', email);
    return res.status(200).json({ message: 'User logged in successfully', token, userId: user._id });

  } catch(error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Error when logging in.' });
  }
})

// Update user route
app.put('/user/:id', checkToken, async (req, res) => {
  const { name, email } = req.body;
  const { id } = req.params;

  if (!name || !email) {
    return res.status(422).json({ message: 'Name and email are required.' });
  }

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const userEmail = await User.findOne({ email: email });

    if (userEmail && userEmail._id.toString() !== id) {
      console.log('Email already registered, use another');
      return res.status(422).json({ message: 'Email already registered, use another.' });
    }

    user.name = name;
    user.email = email;
    await user.save();

    console.log('Update successful -> ', user, email);
    return res.status(200).json({ message: 'Data updated successfully!' });

  } catch (error) {
    console.error('Data update error', error);
    return res.status(500).json({ message: 'Data update error.' });
  }
});

// Update password route
app.put('/user/:id/password', checkToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { id } = req.params;

  if (!currentPassword || !newPassword) {
    return res.status(422).json({ message: 'Current password and new password are required.' });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const checkPassword = await bcrypt.compare(currentPassword, user.password);
    if (!checkPassword) {
      return res.status(422).json({ message: 'Invalid current password.' });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    user.password = passwordHash;
    await user.save();

    return res.status(200).json({ message: 'Password update successfully!' });

  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ message: 'Update password error.' });
  }
});

// Soft delete user route
app.delete('/user/:id', checkToken, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.active = false;
    await user.save();

    console.error('User deactivated (soft delete) successfully -> ', user.email);
    return res.status(200).json({ message: 'Deleted user successfully.' });

  } catch (error) {
    console.error('Error soft deleting user:', error);
    return res.status(500).json({ message: 'Soft delete user error.' });
  }
});
