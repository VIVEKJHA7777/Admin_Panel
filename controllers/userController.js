const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');

// Register User (Only Admin)
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password,roleName } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const role= await Role.create({ name: roleName });
        
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      RoleId: role.id || null
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error("Error in registerUser controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Fetch the user's role
    const role = await Role.findByPk(user.RoleId);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: role.name }, // Include user ID and role in the token
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set the token as a cookie
    res.cookie('token', token, {
      httpOnly: true, // Prevent client-side access to the cookie
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({ message: 'Login successful', user: { id: user.id, email: user.email, role: role.name,token:token } });
  } catch (err) {
    console.error("Error in loginUser controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//getAlluser sroute..................

exports.getAllUsers = async (req, res) => {
  try {
    // Retrieve all users and their roles
    const users = await User.findAll({
      include: [{
        model: Role,
        attributes: ['name'], // Include role name
      }],
      attributes: ['id', 'username', 'email'], // Specify the fields you want to retrieve
    });

    res.status(200).json({ users });
  } catch (err) {
    console.error("Error in getAllUsers controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// getUserById................................
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user by ID, including the role
    const user = await User.findByPk(id, {
      include: [{
        model: Role,
        attributes: ['name'], // Include the role name
      }],
      attributes: ['id', 'username', 'email'], // Specify the user fields to retrieve
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Return user details including role
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.Role ? user.Role.name : null, // Include the role name
    });
  } catch (err) {
    console.error("Error in getUserById controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};