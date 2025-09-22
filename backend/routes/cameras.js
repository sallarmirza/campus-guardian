// routes/cameras.js
const express = require('express');
const { Camera, Incident } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { cameraValidation } = require('../middleware/validation');
const router = express.Router();

// Get all cameras
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, location } = req.query;
    
    const where = {};
    if (status) where.status = status;
    if (location) where.location = { [Op.iLike]: `%${location}%` };

    const { Op } = require('sequelize');
    const cameras = await Camera.findAll({
      where,
      order: [['name', 'ASC']],
      include: [
        {
          model: Incident,
          as: 'incidents',
          attributes: ['id', 'type', 'status', 'detectedAt'],
          limit: 5,
          order: [['detectedAt', 'DESC']]
        }
      ]
    });

    res.json(cameras);
  } catch (error) {
    console.error('Get cameras error:', error);
    res.status(500).json({ error: 'Failed to fetch cameras' });
  }
});

// Create new camera
router.post('/', authenticateToken, authorizeRoles('admin'), cameraValidation.create, async (req, res) => {
  try {
    const camera = await Camera.create(req.body);
    res.status(201).json(camera);
  } catch (error) {
    console.error('Create camera error:', error);
    res.status(500).json({ error: 'Failed to create camera' });
  }
});

// Update camera
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const camera = await Camera.findByPk(req.params.id);
    if (!camera) {
      return res.status(404).json({ error: 'Camera not found' });
    }

    await camera.update(req.body);
    res.json(camera);
  } catch (error) {
    console.error('Update camera error:', error);
    res.status(500).json({ error: 'Failed to update camera' });
  }
});

module.exports = router;