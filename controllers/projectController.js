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
