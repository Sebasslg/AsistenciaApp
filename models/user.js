'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Asociaciones entre modelos
     */
    static associate(models) {
      // Por ejemplo, si luego agregas tabla Attendance
      // User.hasMany(models.Attendance, { foreignKey: 'userId' });
    }
  }

  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'Debe ser un correo válido' }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: { args: [6, 100], msg: 'La contraseña debe tener al menos 6 caracteres' }
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'employee'),
      allowNull: false,
      defaultValue: 'employee',
      validate: {
        isIn: {
          args: [['admin', 'employee']],
          msg: 'El rol debe ser admin o employee'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'Users', // Nombre explícito de la tabla
    timestamps: true,   // createdAt y updatedAt
  });

  return User;
};
