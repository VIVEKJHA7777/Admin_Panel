const express = require('express');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const logRoutes = require('./routes/logRoutes');
require('dotenv').config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cookieParser());

require('./models/associations');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/audit-logs',logRoutes); 



sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Database connected");
  });
});
