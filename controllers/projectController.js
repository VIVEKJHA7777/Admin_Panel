const Project = require('../models/Project');
const User = require('../models/User');
//const Role = require('../models/Role');

// POST /project - Create a new project and assign to a specific manager
exports.createProject = async (req, res) => {
  try {
    const { name, description, managerId } = req.body;

    // Find the manager by ID
    const manager = await User.findOne({ where: { id: managerId } });

    // Create a new project and associate it with the manager
    const project = await Project.create({
      name,
      description,
      UserId: managerId, // Assign to the manager
    });

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating project', error });
  }
};

//get all projects................................

// GET /project - Get a list of all projects and their assigned manager
exports.getProjects = async (req, res) => {
  try {
    // Retrieve all projects with their assigned manager
    const projects = await Project.findAll({
      include: [
        {
          model: User, // Join with User model (manager)
          as: 'user', // Use alias 'user' for manager
          attributes: ['id', 'username', 'email'], // Get only the necessary fields
        }
      ]
    });

    res.status(200).json({ projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving projects', error });
  }
};


// GET /project/:id - Get details of a specific project by ID
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    // Retrieve the project by ID along with the assigned manager
    const project = await Project.findOne({
      where: { id },
      include: [
        {
          model: User, // Join with User model (manager)
          as: 'user', // Use alias 'user' for manager
          attributes: ['id', 'username', 'email'], // Get only the necessary fields
        }
      ]
    });

    // Check if project exists
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving project', error });
  }
};

// PUT /project/:id - Update the details of a project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, managerId } = req.body;

    // Find the project by ID
    const project = await Project.findOne({ where: { id } });

    // Check if project exists
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Optionally, check if the user making the request is an admin
    // For simplicity, assuming req.user.role === 'admin' indicates an admin user

    // If managerId is provided, check if the manager exists
    if (managerId) {
      const manager = await User.findOne({ where: { id: managerId } });
      if (!manager) {
        return res.status(400).json({ message: 'Manager not found' });
      }
    }

    // Update the project details
    await project.update({
      name,
      description,
      UserId: managerId // Update manager if provided
    });

    res.status(200).json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating project', error });
  }
};


