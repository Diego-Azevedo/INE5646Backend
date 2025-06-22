const express = require('express');
const router = express.Router();
const checkToken = require('../middlewares/checkToken');
const {
  publicRoute,
  getUserById,
  updateUser,
  updatePassword,
  softDeleteUser,
} = require('../controllers/userController');

// Rota pública
router.get('/', publicRoute);

// Rotas privadas
router.get('/:id', checkToken, getUserById);
router.put('/:id', checkToken, updateUser);
router.put('/:id/password', checkToken, updatePassword);
router.delete('/:id', checkToken, softDeleteUser);

module.exports = router;
