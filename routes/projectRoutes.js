const express = require('express');
const router = express.Router();
const { createProject } = require('../controllers/projectController');
const { isAdmin } = require('../middleware/authMiddleware');

// POST /project - Create a new project and assign to Managers (Accessible only by Admins)
router.post('/create', isAdmin, createProject);

module.exports = router;
