const express = require('express');
const sequelize = require('./config/db');
//const authRoutes = require('./routes/authRoutes');
//const userRoutes = require('./routes/userRoutes');
require('dotenv').config();
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

// Routes
//app.use('/auth', authRoutes);
//app.use('/users', userRoutes);


sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Database connected");
  });
});
