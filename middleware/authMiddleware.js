const jwt = require('jsonwebtoken');

const isAdmin = (req, res, next) => {
  const token = req.cookies.token; 

  if (!token) {
    return res.status(403).json({ message: 'No token provided, access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded.role);
    if (decoded.role !== 'Admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    req.user = decoded; 
    next(); 
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const isManager = (req, res, next) => {
  const token = req.cookies.token; 

  if (!token) {
    return res.status(403).json({ message: 'No token provided, access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded.role);
    if (decoded.role !== 'Manager') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    req.user = decoded; 
    next(); 
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = {isAdmin,isManager};