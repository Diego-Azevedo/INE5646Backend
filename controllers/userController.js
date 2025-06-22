const User = require('../models/User');
const bcrypt = require('bcrypt');

// Rota pública: /
async function publicRoute(req, res) {
  res.status(200).json({ message: 'Hello World!' });
}

// Rota privada: Buscar usuário por ID
async function getUserById(req, res) {
  const { id } = req.params;

  try {
    const user = await User.findById(id, '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('[Error] Get user error:', error);
    res.status(500).json({ message: 'Error retrieving user.' });
  }
}

// Atualizar nome e email
async function updateUser(req, res) {
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

    const existingEmail = await User.findOne({ email: email });
    if (existingEmail && existingEmail._id.toString() !== id) {
      console.log('[Error] Email already registered, use another');
      return res.status(422).json({ message: 'Email already registered, use another.' });
    }

    user.name = name;
    user.email = email;
    await user.save();

    console.log('Update successful ->', name, email);
    res.status(200).json({ message: 'Data updated successfully!' });

  } catch (error) {
    console.error('[Error] Data update error:', error);
    res.status(500).json({ message: 'Data update error.' });
  }
}

// Atualizar senha
async function updatePassword(req, res) {
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

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(422).json({ message: 'Invalid current password.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully!' });

  } catch (error) {
    console.error('[Error] Update password error:', error);
    res.status(500).json({ message: 'Update password error.' });
  }
}

// Soft delete (inativar usuário)
async function softDeleteUser(req, res) {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.active = false;
    await user.save();

    console.log('[Info] User soft deleted ->', user.email);
    res.status(200).json({ message: 'User deleted successfully.' });

  } catch (error) {
    console.error('[Error] Soft delete user error:', error);
    res.status(500).json({ message: 'Soft delete user error.' });
  }
}

module.exports = {
  publicRoute,
  getUserById,
  updateUser,
  updatePassword,
  softDeleteUser,
};
