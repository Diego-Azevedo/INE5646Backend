const express = require('express');
const router = express.Router();
const checkToken = require('../middlewares/checkToken');
const { loginUpdateLimiter } = require('../middlewares/rateLimiters');
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
router.put('/:id', loginUpdateLimiter, checkToken, updateUser);
router.put('/:id/password', loginUpdateLimiter, checkToken, updatePassword);
router.delete('/:id', checkToken, softDeleteUser);

module.exports = router;
