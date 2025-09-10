'use strict';
const {
  Model
} = require('sequelize');

// Exporta el modelo User para Sequelize
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Método auxiliar para definir asociaciones entre modelos.
     * No es parte del ciclo de vida de Sequelize.
     * El archivo models/index lo llamará automáticamente.
     */
    static associate(models) {
      // Aquí puedes definir relaciones si es ncesario
    }
  }

  // Inicializa el modelo User con los campos email, password y rol
  User.init({
    email: DataTypes.STRING,      // Correo electrónico del usuario
    password: DataTypes.STRING,   // Contraseña del usuario
    role: DataTypes.STRING        // Rol del usuario (admin, empleado)
  }, {
    sequelize,                    // Instancia de Sequelize
    modelName: 'User',            // Nombre del modelo
  });

  return User; // Retorna el modelo para usarlo en otras partes de la aplicación
};