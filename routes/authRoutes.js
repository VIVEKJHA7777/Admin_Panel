const express = require('express');
const { signup, login } = require('../controllers/authController');

const router = express.Router();

// Admin Signup Route
router.post('/signup', signup);

// Admin Login Route
router.post('/login', login);

module.exports = router;
