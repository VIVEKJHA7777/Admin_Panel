const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { logAudit } = require('./logController');

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password,roleName } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      role = await Role.create({ name: roleName }); 
    }

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      RoleId: role.id || null
    });

    await logAudit('User Created', "Admin", `Admin ID: ${req.user.id}`);

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error("Error in registerUser controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const role = await Role.findByPk(user.RoleId);

    const token = jwt.sign(
      { id: user.id, role: role.name }, 
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 3600000, 
    });

    res.status(200).json({ message: 'Login successful', user: { id: user.id, email: user.email, role: role.name,token:token } });
  } catch (err) {
    console.error("Error in loginUser controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {

    const users = await User.findAll({
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name'],
      }],
      attributes: ['id', 'username', 'email'], 
    });

    res.status(200).json({ users });
  } catch (err) {
    console.error("Error in getAllUsers controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      include: [{
        model: Role,
        as: 'role',
        attributes: ['name'],
      }],
      attributes: ['id', 'username', 'email'],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role ? user.role.name : null, 
    });
  } catch (err) {
    console.error("Error in getUserById controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, roleName } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentRole = await Role.findByPk(user.RoleId);
    if (!currentRole) {
      return res.status(400).json({ message: 'Current role not found' });
    }

    if (roleName && roleName !== currentRole.name) {

      let newRole = await Role.findOne({ where: { name: roleName } });

      if (!newRole) {
        newRole = await Role.create({ name: roleName });
      }

      user.RoleId = newRole.id;
    }

    if (username) user.username = username;
    if (email) user.email = email;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: roleName || currentRole.name 
      }
    });
  } catch (err) {
    console.error("Error in updateUser controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();

    res.status(200).json({
      message: 'User soft deleted successfully',
      deletedAt: user.deletedAt
    });
  } catch (err) {
    console.error("Error in softDeleteUser controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.permanentDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, { paranoid: false }); 
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy({ force: true });

    res.status(200).json({ message: 'User permanently deleted successfully' });
  } catch (err) {
    console.error("Error in permanentDeleteUser controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.restoreUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, { paranoid: false });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.deletedAt) {
      return res.status(400).json({ message: 'User is not deleted' });
    }

    await user.restore();

    res.status(200).json({ message: 'User restored successfully' });
  } catch (err) {
    console.error("Error in restoreUser controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.assignRoleToUser = async (req, res) => {
  try {
    const { id } = req.params; 
    const { roleName } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      role = await Role.create({ name: roleName }); 
    }

    user.RoleId = role.id;
    await user.save();

    res.status(200).json({
      message: 'Role assigned to user successfully',
      user,
      role
    });
  } catch (err) {
    console.error("Error in assignRoleToUser controller:", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.revokeRoleFromUser = async (req, res) => {
  try {
    const { id } = req.params; 

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.RoleId) {
      return res.status(400).json({ message: 'User has no role assigned' });
    }

    user.RoleId = null;
    await user.save();

    res.status(200).json({
      message: 'Role revoked from user successfully',
      user
    });
  } catch (err) {
    console.error("Error in revokeRoleFromUser controller:", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};