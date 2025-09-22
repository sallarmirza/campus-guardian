// models/Incident.js
module.exports = (sequelize, DataTypes) => {
  const Incident = sequelize.define('Incident', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('smoking', 'dress_code', 'other'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'dismissed', 'resolved'),
      defaultValue: 'pending'
    },
    confidence: {
      type: DataTypes.FLOAT,
      validate: {
        min: 0,
        max: 1
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    imageUrl: {
      type: DataTypes.STRING
    },
    videoUrl: {
      type: DataTypes.STRING
    },
    detectedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    verifiedAt: {
      type: DataTypes.DATE
    },
    verificationNotes: {
      type: DataTypes.TEXT
    },
    studentId: {
      type: DataTypes.UUID,
      references: {
        model: 'students',
        key: 'id'
      }
    },
    reportedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    cameraId: {
      type: DataTypes.UUID,
      references: {
        model: 'cameras',
        key: 'id'
      }
    }
  }, {
    tableName: 'incidents',
    timestamps: true
  });

  Incident.associate = function(models) {
    Incident.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });
    Incident.belongsTo(models.User, {
      foreignKey: 'reportedBy',
      as: 'reporter'
    });
    Incident.belongsTo(models.Camera, {
      foreignKey: 'cameraId',
      as: 'camera'
    });
    Incident.hasMany(models.Violation, {
      foreignKey: 'incidentId',
      as: 'violations'
    });
  };

  return Incident;
};