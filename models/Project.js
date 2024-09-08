const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define the Project model
const Project = sequelize.define('Project', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  UserId: { // Foreign key that references the User model
    type: DataTypes.INTEGER,
    references: {
      model: 'Users', 
      key: 'id'
    }
  }
}, {
  paranoid: true,
  timestamps: true,
});

module.exports = Project;

//getAll project ......................................

