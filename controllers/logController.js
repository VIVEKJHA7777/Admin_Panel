const AuditLog = require('../models/AuditLog');

async function logAudit(action, performedBy, targetResource) {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetResource
    });
  } catch (error) {
    console.error('Error logging audit:', error);
  }
}

const getAuditLogs = async (req, res) => {
  try {
    const auditLogs = await AuditLog.findAll();

    res.status(200).json({ auditLogs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving audit logs', error });
  }
};

module.exports = { logAudit,getAuditLogs };;