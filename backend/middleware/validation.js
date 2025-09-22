// middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

const studentValidation = {
  create: [
    body('studentId').isLength({ min: 5, max: 20 }).isAlphanumeric(),
    body('firstName').isLength({ min: 1, max: 50 }).trim(),
    body('lastName').isLength({ min: 1, max: 50 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('department').isLength({ min: 1, max: 100 }).trim(),
    body('year').isInt({ min: 1, max: 6 }),
    body('phone').optional().isMobilePhone(),
    handleValidationErrors
  ],
  update: [
    param('id').isUUID(),
    body('firstName').optional().isLength({ min: 1, max: 50 }).trim(),
    body('lastName').optional().isLength({ min: 1, max: 50 }).trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('department').optional().isLength({ min: 1, max: 100 }).trim(),
    body('year').optional().isInt({ min: 1, max: 6 }),
    body('phone').optional().isMobilePhone(),
    handleValidationErrors
  ]
};

const incidentValidation = {
  create: [
    body('type').isIn(['smoking', 'dress_code', 'other']),
    body('location').isLength({ min: 1, max: 200 }).trim(),
    body('description').optional().isLength({ max: 1000 }).trim(),
    body('confidence').optional().isFloat({ min: 0, max: 1 }),
    body('studentId').optional().isUUID(),
    body('cameraId').optional().isUUID(),
    handleValidationErrors
  ],
  update: [
    param('id').isUUID(),
    body('status').optional().isIn(['pending', 'verified', 'dismissed', 'resolved']),
    body('verificationNotes').optional().isLength({ max: 1000 }).trim(),
    handleValidationErrors
  ]
};

const violationValidation = {
  create: [
    body('type').isIn(['smoking', 'dress_code', 'unauthorized_access', 'other']),
    body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('penaltyAmount').optional().isDecimal(),
    body('description').optional().isLength({ max: 1000 }).trim(),
    body('studentId').isUUID(),
    body('incidentId').isUUID(),
    handleValidationErrors
  ]
};

const cameraValidation = {
  create: [
    body('name').isLength({ min: 1, max: 100 }).trim(),
    body('location').isLength({ min: 1, max: 200 }).trim(),
    body('ipAddress').optional().isIP(),
    body('rtspUrl').optional().isURL(),
    body('latitude').optional().isDecimal(),
    body('longitude').optional().isDecimal(),
    handleValidationErrors
  ]
};

module.exports = {
  handleValidationErrors,
  studentValidation,
  incidentValidation,
  violationValidation,
  cameraValidation
};