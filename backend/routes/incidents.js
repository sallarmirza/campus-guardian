// routes/incidents.js
const express = require('express');
const { Incident, Student, User, Camera } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { incidentValidation } = require('../middleware/validation');
const router = express.Router();

// Get all incidents
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (startDate || endDate) {
      where.detectedAt = {};
      if (startDate) where.detectedAt[Op.gte] = new Date(startDate);
      if (endDate) where.detectedAt[Op.lte] = new Date(endDate);
    }

    const { Op } = require('sequelize');
    const incidents = await Incident.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['detectedAt', 'DESC']],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: Camera,
          as: 'camera',
          attributes: ['id', 'name', 'location']
        }
      ]
    });

    res.json({
      incidents: incidents.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: incidents.count,
        pages: Math.ceil(incidents.count / limit)
      }
    });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ error: 'Failed to fetch incidents' });
  }
});

// Create new incident
router.post('/', authenticateToken, incidentValidation.create, async (req, res) => {
  try {
    const incidentData = {
      ...req.body,
      reportedBy: req.user.id
    };

    const incident = await Incident.create(incidentData);
    
    // Emit real-time notification
    const io = req.app.get('io');
    io.emit('new_incident', {
      id: incident.id,
      type: incident.type,
      location: incident.location,
      detectedAt: incident.detectedAt
    });

    res.status(201).json(incident);
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({ error: 'Failed to create incident' });
  }
});

// Update incident (verify/dismiss)
router.put('/:id', authenticateToken, incidentValidation.update, async (req, res) => {
  try {
    const incident = await Incident.findByPk(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const updateData = req.body;
    if (updateData.status === 'verified' || updateData.status === 'dismissed') {
      updateData.verifiedAt = new Date();
    }

    await incident.update(updateData);
    
    // Emit real-time update
    const io = req.app.get('io');
    io.emit('incident_updated', {
      id: incident.id,
      status: incident.status,
      updatedBy: req.user.username
    });

    res.json(incident);
  } catch (error) {
    console.error('Update incident error:', error);
    res.status(500).json({ error: 'Failed to update incident' });
  }
});

module.exports = router;