const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
  action: { type: DataTypes.STRING, allowNull: false },
  performedBy: { type: DataTypes.STRING, allowNull: false },
  targetResource: { type: DataTypes.STRING, allowNull: true },
});

module.exports = AuditLog;
