const express = require('express');
const { registerUser } = require('../controllers/userController');
const isAdmin = require('../middleware/authMiddleware');

const router = express.Router();

// Register User Route
router.post('/register', isAdmin, registerUser);

module.exports = router;
