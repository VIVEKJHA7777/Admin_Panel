const express = require('express');
const { signup, login,logout } = require('../controllers/authController');

const router = express.Router();

// Admin Signup Route
router.post('/signup', signup);

// Admin Login Route
router.post('/login', login);

//Admin logout Route
router.post('/logout', logout);

module.exports = router;
