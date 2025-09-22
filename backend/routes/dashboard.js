// backend/routes/dashboard.js
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const dashboardController = require('../controllers.js/dashboardController');

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticateToken);

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', dashboardController.getStats);

// GET /api/dashboard/incidents/recent - Get recent incidents
router.get('/incidents/recent', dashboardController.getRecentIncidents);

// GET /api/dashboard/trends - Get incident trends for charts
router.get('/trends', dashboardController.getIncidentTrends);

// GET /api/dashboard/health - Get system health status
router.get('/health', dashboardController.getSystemHealth);

module.exports = router;