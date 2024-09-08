const User = require('./User');
const Project = require('./Project');

// Define associations
User.hasMany(Project, { foreignKey: 'UserId', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'UserId', as: 'user' });

// Export models if needed
module.exports = { User, Project };
