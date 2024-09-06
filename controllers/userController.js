const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');

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
      RoleId: role.id 
    });
    
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error("Error in registerUser controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};
