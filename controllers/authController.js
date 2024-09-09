const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const { logAudit } = require('./logController');

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let adminRole = await Role.findOne({ where: { name: 'Admin' } });

    if (!adminRole) {
      adminRole = await Role.create({ name: 'Admin' });
    }

    const existingAdmin = await User.findOne({
      where: { RoleId: adminRole.id }, 
    });

    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await User.create({
      username,
      email,
      password: hashedPassword,
      RoleId: adminRole.id, 
    });

    await logAudit('Admin Created', "Admin");

    const token = jwt.sign(
      { id: newAdmin.id, role: 'Admin' }, 
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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const role = await Role.findByPk(user.RoleId); 
    if (role.name !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

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

exports.logout = async(req, res) => {
  try{
      res.cookie("token","",{maxAge:0});
      res.status(200).json({message:"Logged out successfully"});
  }
  catch(err){
    console.log("error in logout controller ",err.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}