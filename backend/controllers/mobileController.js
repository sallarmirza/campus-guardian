// backend/controllers/mobileController.js
const { MobileCamera, Incident } = require('../models');

const mobileController = {
  async registerDevice(req, res) {
    try {
      const { deviceId, deviceName, deviceInfo } = req.body;
      const userId = req.user.id;

      const mobileCamera = await MobileCamera.findOrCreate({
        where: { deviceId },
        defaults: {
          deviceId,
          deviceName,
          userId,
          deviceInfo,
          isActive: true,
          lastSeen: new Date(),
        }
      });

      res.json({
        message: 'Device registered successfully',
        camera: mobileCamera[0]
      });
    } catch (error) {
      console.error('Device registration error:', error);
      res.status(500).json({ error: 'Failed to register device' });
    }
  },

  async submitMobileIncident(req, res) {
    try {
      const {
        type,
        location,
        description,
        confidence,
        deviceInfo,
        imageBase64
      } = req.body;
      
      const userId = req.user.id;

      // Register or update mobile camera
      const [mobileCamera] = await MobileCamera.findOrCreate({
        where: { deviceId: deviceInfo.deviceId || `${deviceInfo.brand}-${deviceInfo.modelName}` },
        defaults: {
          deviceId: deviceInfo.deviceId || `${deviceInfo.brand}-${deviceInfo.modelName}`,
          deviceName: deviceInfo.deviceName || deviceInfo.modelName,
          userId,
          deviceInfo,
          isActive: true,
          lastSeen: new Date(),
        }
      });

      // Create incident
      const incident = await Incident.create({
        type,
        location,
        description,
        confidence,
        detectionMethod: 'mobile',
        reportedBy: userId,
        mobileCameraId: mobileCamera.id,
        // TODO: Handle image upload to storage service
        // imageUrl: await uploadImageToStorage(imageBase64),
      });

      res.status(201).json({
        message: 'Incident submitted successfully',
        incident
      });
    } catch (error) {
      console.error('Mobile incident submission error:', error);
      res.status(500).json({ error: 'Failed to submit incident' });
    }
  }
};

module.exports = mobileController;