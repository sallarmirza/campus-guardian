const { Incident, Student, User, Camera, Violation } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Get all incidents with filtering and pagination
exports.getAllIncidents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      startDate,
      endDate,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where clause
    const where = {};
    
    if (status) where.status = status;
    if (type) where.type = type;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    // Search functionality
    const include = [
      {
        model: User,
        as: 'reporter',
        attributes: ['id', 'firstName', 'lastName', 'role']
      },
      {
        model: Student,
        as: 'student',
        attributes: ['id', 'firstName', 'lastName', 'studentId'],
        required: false,
        where: search ? {
          [Op.or]: [
            { firstName: { [Op.iLike]: `%${search}%` } },
            { lastName: { [Op.iLike]: `%${search}%` } },
            { studentId: { [Op.iLike]: `%${search}%` } }
          ]
        } : undefined
      },
      {
        model: Camera,
        as: 'camera',
        attributes: ['id', 'name', 'location', 'type']
      }
    ];

    const { count, rows: incidents } = await Incident.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    res.json({
      incidents,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({
      error: 'Failed to get incidents',
      message: error.message
    });
  }
};

// Get single incident by ID
exports.getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const incident = await Incident.findByPk(id, {
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'firstName', 'lastName', 'role']
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'studentId', 'email']
        },
        {
          model: Camera,
          as: 'camera',
          attributes: ['id', 'name', 'location', 'type']
        },
        {
          model: Violation,
          as: 'violations'
        }
      ]
    });

    if (!incident) {
      return res.status(404).json({
        error: 'Incident not found'
      });
    }

    res.json(incident);

  } catch (error) {
    console.error('Get incident error:', error);
    res.status(500).json({
      error: 'Failed to get incident',
      message: error.message
    });
  }
};

// Create new incident (from mobile app)
exports.createIncident = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      type,
      location,
      description,
      confidence,
      studentId,
      cameraId,
      imageUrl,
      videoUrl
    } = req.body;

    const incident = await Incident.create({
      type,
      location,
      description,
      confidence,
      studentId,
      cameraId,
      imageUrl,
      videoUrl,
      reportedBy: req.user.id,
      status: 'pending'
    });

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      const incidentWithDetails = await Incident.findByPk(incident.id, {
        include: [
          { model: User, as: 'reporter', attributes: ['firstName', 'lastName'] },
          { model: Student, as: 'student', attributes: ['firstName', 'lastName'] },
          { model: Camera, as: 'camera', attributes: ['name', 'location'] }
        ]
      });

      io.emit('new_incident', incidentWithDetails);
    }

    res.status(201).json({
      message: 'Incident created successfully',
      incident
    });

  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({
      error: 'Failed to create incident',
      message: error.message
    });
  }
};

// Update incident status
exports.updateIncidentStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { status, verificationNotes } = req.body;

    const incident = await Incident.findByPk(id);

    if (!incident) {
      return res.status(404).json({
        error: 'Incident not found'
      });
    }

    const updateData = { 
      status,
      verificationNotes
    };

    // Set verification timestamp if moving to verified status
    if (status === 'verified') {
      updateData.verifiedAt = new Date();
    }

    await incident.update(updateData);

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      const updatedIncident = await Incident.findByPk(id, {
        include: [
          { model: User, as: 'reporter', attributes: ['firstName', 'lastName'] },
          { model: Student, as: 'student', attributes: ['firstName', 'lastName'] }
        ]
      });

      io.emit('incident_updated', updatedIncident);
    }

    res.json({
      message: 'Incident updated successfully',
      incident
    });

  } catch (error) {
    console.error('Update incident error:', error);
    res.status(500).json({
      error: 'Failed to update incident',
      message: error.message
    });
  }
};

// Delete incident
exports.deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;

    const incident = await Incident.findByPk(id);

    if (!incident) {
      return res.status(404).json({
        error: 'Incident not found'
      });
    }

    // Only allow admins to delete incidents
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'Only administrators can delete incidents'
      });
    }

    await incident.destroy();

    res.json({
      message: 'Incident deleted successfully'
    });

  } catch (error) {
    console.error('Delete incident error:', error);
    res.status(500).json({
      error: 'Failed to delete incident',
      message: error.message
    });
  }
};

// Get incident statistics
exports.getIncidentStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let days = 30;
    if (period === '7d') days = 7;
    if (period === '90d') days = 90;
    if (period === '1y') days = 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get statistics
    const stats = await Promise.all([
      // Total incidents by type
      Incident.findAll({
        where: { createdAt: { [Op.gte]: startDate } },
        attributes: [
          'type',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['type']
      }),

      // Incidents by status
      Incident.findAll({
        where: { createdAt: { [Op.gte]: startDate } },
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      }),

      // Daily incident counts
      Incident.findAll({
        where: { createdAt: { [Op.gte]: startDate } },
        attributes: [
          [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
        order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
      })
    ]);

    const [byType, byStatus, daily] = stats;

    res.json({
      byType: byType.map(item => ({
        type: item.type,
        count: parseInt(item.getDataValue('count'))
      })),
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: parseInt(item.getDataValue('count'))
      })),
      daily: daily.map(item => ({
        date: item.getDataValue('date'),
        count: parseInt(item.getDataValue('count'))
      }))
    });

  } catch (error) {
    console.error('Get incident stats error:', error);
    res.status(500).json({
      error: 'Failed to get incident statistics',
      message: error.message
    });
  }
};