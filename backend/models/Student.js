// models/Student.js
module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    studentId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [5, 20]
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 50]
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 50]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        len: [10, 15]
      }
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      validate: {
        min: 1,
        max: 6
      }
    },
    faceEncoding: {
      type: DataTypes.TEXT,
      comment: 'Encoded face data for recognition'
    },
    photoUrl: {
      type: DataTypes.STRING
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    consentGiven: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    consentDate: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'students',
    timestamps: true
  });

  Student.associate = function(models) {
    Student.hasMany(models.Incident, {
      foreignKey: 'studentId',
      as: 'incidents'
    });
    Student.hasMany(models.Violation, {
      foreignKey: 'studentId',
      as: 'violations'
    });
  };

  return Student;
};