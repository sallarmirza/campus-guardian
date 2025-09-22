// backend/controllers/realTimeController.js
const { Incident, Student, MobileCamera, User } = require('../models');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/incidents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `incident-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|mp4|mov/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const realTimeController = {
  // Handle mobile incident submission with ML processing
  async submitMobileIncident(req, res) {
    try {
      const {
        type,
        location,
        description,
        deviceInfo,
        coordinates,
        manual_detection = true
      } = req.body;
      
      const userId = req.user.id;
      const imageFile = req.file;
      
      if (!imageFile) {
        return res.status(400).json({ error: 'Image is required' });
      }

      // Register/update mobile device
      const [mobileCamera] = await MobileCamera.findOrCreate({
        where: { deviceId: deviceInfo.deviceId },
        defaults: {
          deviceId: deviceInfo.deviceId,
          deviceName: deviceInfo.deviceName || deviceInfo.modelName,
          userId,
          deviceInfo,
          isActive: true,
          lastSeen: new Date(),
          location: coordinates ? `${coordinates.latitude}, ${coordinates.longitude}` : null
        }
      });

      // Update device location and last seen
      await mobileCamera.update({
        lastSeen: new Date(),
        location: coordinates ? `${coordinates.latitude}, ${coordinates.longitude}` : mobileCamera.location
      });

      let mlResult = null;
      let finalConfidence = manual_detection ? 1.0 : 0.0;
      
      // Process with ML if not manual detection
      if (!manual_detection) {
        try {
          const mlResponse = await axios.post(
            process.env.ML_SERVICE_URL + '/detect/violations',
            fs.readFileSync(imageFile.path),
            {
              headers: { 'Content-Type': 'application/octet-stream' },
              timeout: 10000
            }
          );
          
          mlResult = mlResponse.data;
          finalConfidence = mlResult.max_confidence || 0.0;
          
          // If ML detected different violations, use those
          if (mlResult.violations_detected && mlResult.violations.length > 0) {
            const detectedTypes = mlResult.violations.map(v => v.type);
            if (!detectedTypes.includes(type)) {
              // ML found different violation type
              type = detectedTypes[0]; // Use first detected violation
            }
          }
        } catch (mlError) {
          console.warn('ML processing failed, proceeding with manual detection:', mlError.message);
          finalConfidence = 0.8; // Fallback confidence for manual detection
        }
      }

      // Create incident record
      const incident = await Incident.create({
        type,
        location: coordinates ? 
          `${coordinates.latitude}, ${coordinates.longitude}` : 
          location || 'Mobile Location',
        description: description || `${type} detected via mobile app`,
        confidence: finalConfidence,
        detectionMethod: manual_detection ? 'mobile_manual' : 'mobile_ml',
        imageUrl: `/uploads/incidents/${imageFile.filename}`,
        reportedBy: userId,
        mobileCameraId: mobileCamera.id,
        status: finalConfidence > 0.7 ? 'verified' : 'pending'
      });

      // Real-time notification to admin panel
      const io = req.app.get('io');
      if (io) {
        const incidentData = await Incident.findByPk(incident.id, {
          include: [
            {
              model: Student,
              as: 'student',
              attributes: ['studentId', 'firstName', 'lastName']
            },
            {
              model: User,
              as: 'reporter',
              attributes: ['username', 'firstName', 'lastName', 'role']
            },
            {
              model: MobileCamera,
              as: 'mobileCamera',
              attributes: ['deviceName', 'location']
            }
          ]
        });

        // Emit to admin dashboard
        io.to('admin_room').emit('new_incident', {
          incident: incidentData,
          mlResult,
          timestamp: new Date().toISOString()
        });

        // Emit to all authenticated users
        io.emit('incident_alert', {
          id: incident.id,
          type: incident.type,
          location: incident.location,
          confidence: incident.confidence,
          reporter: incident.reporter ? 
            `${incident.reporter.firstName} ${incident.reporter.lastName}` : 
            'Unknown',
          device: incident.mobileCamera ? incident.mobileCamera.deviceName : 'Unknown Device'
        });
      }

      res.status(201).json({
        message: 'Incident submitted successfully',
        incident: {
          id: incident.id,
          type: incident.type,
          status: incident.status,
          confidence: incident.confidence,
          mlResult
        }
      });

    } catch (error) {
      console.error('Mobile incident submission error:', error);
      res.status(500).json({ 
        error: 'Failed to submit incident',
        details: error.message 
      });
    }
  },

  // Live video streaming endpoint
  async startLiveStream(req, res) {
    try {
      const { deviceId, streamType = 'surveillance' } = req.body;
      const userId = req.user.id;

      // Find mobile camera
      const mobileCamera = await MobileCamera.findOne({
        where: { deviceId, userId }
      });

      if (!mobileCamera) {
        return res.status(404).json({ error: 'Device not found' });
      }

      // Generate stream session
      const streamSession = {
        sessionId: `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        deviceId,
        userId,
        streamType,
        startedAt: new Date(),
        isActive: true
      };

      // Notify admin panel about live stream
      const io = req.app.get('io');
      if (io) {
        io.to('admin_room').emit('live_stream_started', {
          session: streamSession,
          device: {
            name: mobileCamera.deviceName,
            location: mobileCamera.location
          },
          user: req.user
        });
      }

      res.json({
        message: 'Live stream session created',
        session: streamSession
      });

    } catch (error) {
      console.error('Live stream error:', error);
      res.status(500).json({ error: 'Failed to start live stream' });
    }
  }
};

module.exports = { realTimeController, upload };