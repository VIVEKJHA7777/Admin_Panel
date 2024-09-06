const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Role = require('./Role');

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  RoleId: { // Use capital 'R' to match the actual column name in the database
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Role, // Reference the Role model
      key: 'id',   // Reference the 'id' field in the Role model
    },
  },
});

User.belongsTo(Role); // Define association

module.exports = User;
