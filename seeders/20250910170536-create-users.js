'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      email: 'admin@empresa.com',
      password: '1234',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'empleado@empresa.com',
      password: '1234',
      role: 'employee', 
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};