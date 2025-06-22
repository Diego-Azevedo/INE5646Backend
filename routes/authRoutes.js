const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { loginUpdateLimiter, registerLimiter } = require('../middlewares/rateLimiters');

router.post('/login', loginUpdateLimiter, login);
router.post('/register', registerLimiter, register);

module.exports = router;
