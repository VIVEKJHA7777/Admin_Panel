const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Role = require('./Role');

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
  RoleId: { // Foreign key for role association
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Role, // Reference the Role model
      key: 'id'    // Reference the 'id' field in Role model
    }
  }
}, {
  paranoid: true, // Enables soft delete (sets "deletedAt" timestamp instead of deleting the row)
  timestamps: true, // Keeps track of "createdAt" and "updatedAt" timestamps
  deletedAt: 'deletedAt' // The name of the field that will store the deletion timestamp
});

// Define associations
User.belongsTo(Role, {
  foreignKey: 'RoleId',
  as: 'role'
});

module.exports = User;
