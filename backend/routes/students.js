// routes/students.js
const express = require('express');
const { Student, Incident, Violation } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { studentValidation } = require('../middleware/validation');
const router = express.Router();

// Get all students
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, year, active } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { studentId: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (department) where.department = department;
    if (year) where.year = year;
    if (active !== undefined) where.isActive = active === 'true';

    const { Op } = require('sequelize');
    const students = await Student.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['lastName', 'ASC'], ['firstName', 'ASC']],
      include: [
        {
          model: Incident,
          as: 'incidents',
          attributes: ['id', 'type', 'status', 'detectedAt']
        }
      ]
    });

    res.json({
      students: students.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: students.count,
        pages: Math.ceil(students.count / limit)
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get student by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        {
          model: Incident,
          as: 'incidents',
          include: ['camera']
        },
        {
          model: Violation,
          as: 'violations'
        }
      ]
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Create new student
router.post('/', authenticateToken, authorizeRoles('admin', 'supervisor'), studentValidation.create, async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Student ID or email already exists' });
    }
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

// Update student
router.put('/:id', authenticateToken, authorizeRoles('admin', 'supervisor'), studentValidation.update, async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await student.update(req.body);
    res.json(student);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

// Delete student (soft delete)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await student.update({ isActive: false });
    res.json({ message: 'Student deactivated successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

module.exports = router;