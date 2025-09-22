// routes/analytics.js
const express = require('express');
const { Incident, Violation, Student, Camera } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');
const router = express.Router();

// Dashboard statistics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalStudents,
      activeStudents,
      totalCameras,
      activeCameras,
      todayIncidents,
      weekIncidents,
      monthIncidents,
      pendingIncidents,
      activeViolations
    ] = await Promise.all([
      Student.count(),
      Student.count({ where: { isActive: true } }),
      Camera.count(),
      Camera.count({ where: { status: 'active' } }),
      Incident.count({ where: { detectedAt: { [Op.gte]: startOfDay } } }),
      Incident.count({ where: { detectedAt: { [Op.gte]: startOfWeek } } }),
      Incident.count({ where: { detectedAt: { [Op.gte]: startOfMonth } } }),
      Incident.count({ where: { status: 'pending' } }),
      Violation.count({ where: { status: 'active' } })
    ]);

    res.json({
      students: { total: totalStudents, active: activeStudents },
      cameras: { total: totalCameras, active: activeCameras },
      incidents: {
        today: todayIncidents,
        thisWeek: weekIncidents,
        thisMonth: monthIncidents,
        pending: pendingIncidents
      },
      violations: { active: activeViolations }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Violation trends
router.get('/trends', authenticateToken, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    let startDate;
    
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    const incidents = await Incident.findAll({
      where: {
        detectedAt: { [Op.gte]: startDate }
      },
      attributes: ['type', 'detectedAt'],
      order: [['detectedAt', 'ASC']]
    });

    const violations = await Violation.findAll({
      where: {
        createdAt: { [Op.gte]: startDate }
      },
      attributes: ['type', 'severity', 'createdAt'],
      order: [['createdAt', 'ASC']]
    });

    res.json({
      incidents,
      violations,
      period,
      startDate
    });
  } catch (error) {
    console.error('Trends analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch trends data' });
  }
});

module.exports = router;