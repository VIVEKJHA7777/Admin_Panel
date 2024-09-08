const express = require('express');
const router = express.Router();
const { createProject,getProjects,getProjectById,updateProject } = require('../controllers/projectController');
const { isAdmin } = require('../middleware/authMiddleware');

// POST /project - Create a new project and assign to Managers (Accessible only by Admins)
router.post('/create', isAdmin, createProject);

//get all projects route....
router.get('/getAllproject', isAdmin, getProjects);

// Get details of a specific project by ID
router.get('/getproject/:id', isAdmin, getProjectById);

// Update the details of a project
router.put('/updateProject/:id', isAdmin, updateProject)

module.exports = router;
