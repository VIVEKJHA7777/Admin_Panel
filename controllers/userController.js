const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

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
    //const role= await Role.create({ name: roleName });

    let role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      role = await Role.create({ name: roleName }); // Create the role if it doesn't exist
    }
        
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
    // Retrieve all users and their roles, automatically filtering out soft-deleted users
    const users = await User.findAll({
      include: [{
        model: Role,
        as: 'role', // Alias used in the model association
        attributes: ['name'], // Include role name
      }],
      attributes: ['id', 'username', 'email'], // Specify the fields you want to retrieve
      // No need for `where: { deletedAt: null }` because `paranoid: true` automatically filters out soft-deleted records
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
        as: 'role', // Alias if specified in your model
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
      role: user.role ? user.role.name : null, // Include the role name
    });
  } catch (err) {
    console.error("Error in getUserById controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// updateUserById...............................................

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, roleName } = req.body;

    // Find the user by ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the current role of the user based on RoleId
    const currentRole = await Role.findByPk(user.RoleId);
    if (!currentRole) {
      return res.status(400).json({ message: 'Current role not found' });
    }

    // If a new roleName is provided, check if it's different from the current role
    if (roleName && roleName !== currentRole.name) {
      // Check if the new role exists
      let newRole = await Role.findOne({ where: { name: roleName } });

      // If the role doesn't exist, create it
      if (!newRole) {
        newRole = await Role.create({ name: roleName });
      }

      // Update the RoleId foreign key to the new role
      user.RoleId = newRole.id;
    }

    // Update user fields if they exist in the request body
    if (username) user.username = username;
    if (email) user.email = email;

    // If password is provided, hash the new password
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    // Save the updated user
    await user.save();

    // Return the updated user details
    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: roleName || currentRole.name // Return updated or current role
      }
    });
  } catch (err) {
    console.error("Error in updateUser controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//softDelete..............................................

exports.softDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user by ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Perform soft delete
    await user.destroy(); // This will set the `deletedAt` timestamp

    // Since Sequelize handles soft deletion, the `deletedAt` should be updated.
    res.status(200).json({
      message: 'User soft deleted successfully',
      deletedAt: user.deletedAt // Use the deletedAt from the current user instance
    });
  } catch (err) {
    console.error("Error in softDeleteUser controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};



//Permanent delete...........................................................

exports.permanentDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user by ID
    const user = await User.findByPk(id, { paranoid: false }); // Fetch even soft-deleted users
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Permanently delete the user from the database
    await user.destroy({ force: true });

    res.status(200).json({ message: 'User permanently deleted successfully' });
  } catch (err) {
    console.error("Error in permanentDeleteUser controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};


//restore user...........................................................

exports.restoreUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user by ID, including soft-deleted users
    const user = await User.findByPk(id, { paranoid: false });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is actually soft-deleted
    if (!user.deletedAt) {
      return res.status(400).json({ message: 'User is not deleted' });
    }

    // Restore the user by removing the `deletedAt` timestamp
    await user.restore();

    res.status(200).json({ message: 'User restored successfully' });
  } catch (err) {
    console.error("Error in restoreUser controller: ", err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//Assign Role to users...................................................
exports.assignRoleToUser = async (req, res) => {
  try {
    const { id } = req.params; // User ID from the route parameter
    const { roleName } = req.body; // Role name from the request body

    // Find the user by ID
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the role by name, or create it if it doesn't exist
    let role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      role = await Role.create({ name: roleName }); // Create the role if it doesn't exist
    }

    // Assign the role to the user by updating the RoleId field
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
