// models/Violation.js
module.exports = (sequelize, DataTypes) => {
  const Violation = sequelize.define('Violation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('smoking', 'dress_code', 'unauthorized_access', 'other'),
      allowNull: false
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM('active', 'resolved', 'appealed', 'dismissed'),
      defaultValue: 'active'
    },
    penaltyAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    description: {
      type: DataTypes.TEXT
    },
    appealReason: {
      type: DataTypes.TEXT
    },
    appealedAt: {
      type: DataTypes.DATE
    },
    resolvedAt: {
      type: DataTypes.DATE
    },
    resolvedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      }
    },
    incidentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'incidents',
        key: 'id'
      }
    }
  }, {
    tableName: 'violations',
    timestamps: true
  });

  Violation.associate = function(models) {
    Violation.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });
    Violation.belongsTo(models.Incident, {
      foreignKey: 'incidentId',
      as: 'incident'
    });
    Violation.belongsTo(models.User, {
      foreignKey: 'resolvedBy',
      as: 'resolver'
    });
  };

  return Violation;
};