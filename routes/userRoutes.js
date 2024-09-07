const express = require('express');
const { registerUser, loginUser, getAllUsers,getUserById } = require('../controllers/userController');
const { isAdmin, isManager } = require('../middleware/authMiddleware');

const router = express.Router();

// Register User Route
router.post('/register', isAdmin, registerUser);
router.post('/login', loginUser);

// Get all users route, accessible by both Admin and Manager
router.get('/getAllUsers', (req, res, next) => {
  // Check if the user is admin first
  isAdmin(req, res, (err) => {
    if (err) {
      // If not admin, check if the user is manager
      isManager(req, res, (err) => {
        if (err) {
          // If not manager, return unauthorized error
          return res.status(403).json({ message: 'Unauthorized' });
        } else {
          // Proceed if the user is manager
          next();
        }
      });
    } else {
      // Proceed if the user is admin
      next();
    }
  });
}, getAllUsers);

//getUserById..............

router.get('/getUser/:id', getUserById);



module.exports = router;
