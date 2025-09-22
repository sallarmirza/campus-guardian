// models/Camera.js
module.exports = (sequelize, DataTypes) => {
  const Camera = sequelize.define('Camera', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ipAddress: {
      type: DataTypes.STRING,
      validate: {
        isIP: true
      }
    },
    rtspUrl: {
      type: DataTypes.STRING
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'error'),
      defaultValue: 'active'
    },
    isMLEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    detectionTypes: {
      type: DataTypes.JSON,
      defaultValue: ['smoking', 'dress_code']
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8)
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8)
    },
    installDate: {
      type: DataTypes.DATE
    },
    lastMaintenance: {
      type: DataTypes.DATE
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'cameras',
    timestamps: true
  });

  Camera.associate = function(models) {
    Camera.hasMany(models.Incident, {
      foreignKey: 'cameraId',
      as: 'incidents'
    });
  };

  return Camera;
};