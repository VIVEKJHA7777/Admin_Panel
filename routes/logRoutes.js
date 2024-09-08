const express = require('express');
const { getAuditLogs } = require('../controllers/logController');
const {  isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', isAdmin, getAuditLogs);

module.exports = router;
