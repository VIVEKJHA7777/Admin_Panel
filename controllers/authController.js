const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

// Admin Signup
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the "Admin" role exists
    let adminRole = await Role.findOne({ where: { name: 'Admin' } });

    // If the "Admin" role doesn't exist, create it
    if (!adminRole) {
      adminRole = await Role.create({ name: 'Admin' });
    }

    // Check if an Admin user already exists
    const existingAdmin = await User.findOne({
      where: { RoleId: adminRole.id }, // Match the correct foreign key name
    });

    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Admin user
    const newAdmin = await User.create({
      username,
      email,
      password: hashedPassword,
      RoleId: adminRole.id, // Associate with "Admin" role using correct column name
    });

    // Generate JWT
    const token = jwt.sign(
      { id: newAdmin.id, role: 'Admin' }, // Embed role in the token
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, {
       httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 3600000
    });

    res.status(201).json({ message: 'Admin created', token });
  } catch (err) {
    console.error("Error in admin Signup controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Admin Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is an Admin
    const role = await Role.findByPk(user.RoleId); // Use correct foreign key name
    if (role.name !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: 'Admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
     res.cookie('token', token, {
       httpOnly: true,
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 3600000
      });

    res.json({ message: 'Logged in successfully', token });
  } catch (err) {
    console.error("Error in admin login controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
