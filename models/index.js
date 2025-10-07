'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

const db = {};

// Crear la conexión Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: false, // Cambia a true si quieres ver queries SQL
  }
);

// ===================== CARGA AUTOMÁTICA DE MODELOS =====================
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// ===================== ASOCIACIONES =====================
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Ejemplo de asociación User → Attendance
if (db.User && db.Attendance) {
  db.User.hasMany(db.Attendance, { foreignKey: 'userId', as: 'attendances' });
  db.Attendance.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
}

// ===================== EXPORT =====================
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
