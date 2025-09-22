// routes/violations.js
const express = require('express');
const { Violation, Student, Incident, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { violationValidation } = require('../middleware/validation');
const router = express.Router();

// Get all violations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, studentId } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (studentId) where.studentId = studentId;

    const violations = await Violation.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId', 'firstName', 'lastName', 'department']
        },
        {
          model: Incident,
          as: 'incident',
          attributes: ['id', 'type', 'location', 'detectedAt']
        }
      ]
    });

    res.json({
      violations: violations.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: violations.count,
        pages: Math.ceil(violations.count / limit)
      }
    });
  } catch (error) {
    console.error('Get violations error:', error);
    res.status(500).json({ error: 'Failed to fetch violations' });
  }
});

// Create new violation
router.post('/', authenticateToken, authorizeRoles('admin', 'supervisor'), violationValidation.create, async (req, res) => {
  try {
    const violation = await Violation.create(req.body);
    res.status(201).json(violation);
  } catch (error) {
    console.error('Create violation error:', error);
    res.status(500).json({ error: 'Failed to create violation' });
  }
});

// Update violation status
router.put('/:id', authenticateToken, authorizeRoles('admin', 'supervisor'), async (req, res) => {
  try {
    const violation = await Violation.findByPk(req.params.id);
    if (!violation) {
      return res.status(404).json({ error: 'Violation not found' });
    }

    const updateData = req.body;
    if (updateData.status === 'resolved') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = req.user.id;
    }

    await violation.update(updateData);
    res.json(violation);
  } catch (error) {
    console.error('Update violation error:', error);
    res.status(500).json({ error: 'Failed to update violation' });
  }
});

module.exports = router;