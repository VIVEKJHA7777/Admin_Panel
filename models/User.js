const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Role = require('./Role'); // Import Role model

// Define the User model
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  RoleId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Role,
      key: 'id'
    }
  }
}, {
  paranoid: true,
  timestamps: true,
  deletedAt: 'deletedAt'
});

//module.exports = User;


// Association with Role
User.belongsTo(Role, { foreignKey: 'RoleId', as: 'role' });

// One-to-Many relationship: A User can have many Projects
//User.hasMany(require('./Project'), { foreignKey: 'UserId', as: 'projects' });

module.exports = User;
