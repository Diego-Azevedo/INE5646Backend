const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function register(req, res) {
  const { name, email, password, confirmpassword } = req.body;

  if (!name || !email || !password || !confirmpassword) {
    return res.status(422).json({ message: 'Fill in all fields!' });
  }
  if (password !== confirmpassword) {
    return res.status(422).json({ message: 'Passwords don\'t match!' });
  }

  const userExists = await User.findOne({ email: email });

  if (userExists && userExists.active === false) {
    return res.status(422).json({ message: 'You can\'t use this email. Use another!' });
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
    res.status(201).json({ message: 'User created successfully!' });
  } catch (error) {
    console.error('[Error] Error creating user:', error);
    return res.status(500).json({ message: error });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ message: 'Email and password are required!' });
  }

  const user = await User.findOne({ email: email });

  if (!user || user.active === false) {
    console.log('[Error] User not found -> ', email);
    return res.status(404).json({ message: 'User not found' });
  }

  const checkPassword = await bcrypt.compare(password, user.password);
  if (!checkPassword) {
    console.log('[Error] Invalid password -> ', email);
    return res.status(422).json({ message: 'Invalid password' });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      { id: user._id },
      secret,
    );

    console.log('User logged in successfully -> ', email);
    return res.status(200).json({ message: 'User logged in successfully', token, userId: user._id });

  } catch (error) {
    console.error('[Error] Error during login:', error);
    return res.status(500).json({ message: 'Error during login.' });
  }
}

module.exports = { register, login };
