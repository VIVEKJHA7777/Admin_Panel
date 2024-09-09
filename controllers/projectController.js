const Project = require('../models/Project');
const User = require('../models/User');
const { logAudit } = require('./logController');

exports.createProject = async (req, res) => {
  try {
    const { name, description, managerId } = req.body;

    const manager = await User.findOne({ where: { id: managerId } });

    const project = await Project.create({
      name,
      description,
      UserId: managerId, 
    });

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating project', error });
  }
};

exports.getProjects = async (req, res) => {
  try {

    const projects = await Project.findAll({
      include: [
        {
          model: User, 
          as: 'user', 
          attributes: ['id', 'username', 'email'], 
        }
      ]
    });

    res.status(200).json({ projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving projects', error });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      where: { id },
      include: [
        {
          model: User, 
          as: 'user', 
          attributes: ['id', 'username', 'email'], 
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json({ project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving project', error });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, managerId } = req.body;

    const project = await Project.findOne({ where: { id } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (managerId) {
      const manager = await User.findOne({ where: { id: managerId } });
      if (!manager) {
        return res.status(400).json({ message: 'Manager not found' });
      }
    }

    await project.update({
      name,
      description,
      UserId: managerId 
    });

    res.status(200).json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating project', error });
  }
};

exports.softdeleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({ where: { id } });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.destroy();

    res.status(200).json({ message: 'Project soft deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting project', error });
  }
};

exports.restoreProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      where: { id },
      paranoid: false 
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.restore();

    res.status(200).json({ message: 'Project restored successfully', project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error restoring project', error });
  }
};

exports.permanentDeleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findOne({
      where: { id },
      paranoid: false 
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.destroy({ force: true });

    res.status(200).json({ message: 'Project permanently deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error permanently deleting project', error });
  }
};