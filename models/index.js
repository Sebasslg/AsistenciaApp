'use strict';

// Importa módulos necesarios
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');

// Obtiene el nombre de este archivo
const basename = path.basename(__filename);

// Determina el entorno (por defecto: development)
const env = process.env.NODE_ENV || 'development';

// Carga la configuración de la base de datos según el entorno
const config = require(__dirname + '/../config/config.json')[env];

// Objeto donde se guardarán los modelos
const db = {};

// Inicializa Sequelize según la configuración
let sequelize;
if (config.use_env_variable) {
  // Si se usa variable de entorno para la conexión
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Si se usan datos directos del archivo de configuración
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Lee todos los archivos de modelos en la carpeta actual
fs
  .readdirSync(__dirname)
  .filter(file => {
    // Filtra solo archivos .js que no sean este mismo ni archivos de test
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    // Importa y registra cada modelo en el objeto db
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Ejecuta el método associate de cada modelo si existe (para relaciones)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Agrega la instancia de Sequelize y el constructor al objeto db
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Exporta el objeto db con todos los modelos y la conexión
module.exports = db;
