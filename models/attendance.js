'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Attendance extends Model {
    static associate(models) {
     
    }
  }

  Attendance.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: { // 'entrada' o 'salida'
      type: DataTypes.ENUM('entrada', 'salida'),
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Attendance',
  });

  return Attendance;
};
