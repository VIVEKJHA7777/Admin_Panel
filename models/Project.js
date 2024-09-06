const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Project = sequelize.define('Project', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
});

Project.belongsTo(User, { as: 'createdBy' });
Project.belongsToMany(User, { through: 'UserProjects' });

module.exports = Project;
