const express = require('express');
const router = express.Router();
const { createProject,getProjects,getProjectById,updateProject,softdeleteProject,restoreProject,permanentDeleteProject } = require('../controllers/projectController');
const { isAdmin } = require('../middleware/authMiddleware');

// POST /project - Create a new project and assign to Managers (Accessible only by Admins)
router.post('/create', isAdmin, createProject);

//get all projects route....
router.get('/getAllproject', isAdmin, getProjects);

// Get details of a specific project by ID
router.get('/getproject/:id', isAdmin, getProjectById);

// Update the details of a project
router.put('/updateProject/:id', isAdmin, updateProject);

// Soft delete a project
router.delete('/softdelete/:id', isAdmin, softdeleteProject);

// Route to restore a soft-deleted project
router.patch('/restore/:id', isAdmin, restoreProject);

// Route to permanently delete a project
router.delete('/permanent/:id', isAdmin, permanentDeleteProject);

module.exports = router;
