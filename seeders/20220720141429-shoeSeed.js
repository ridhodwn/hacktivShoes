'use strict';
const fs = require('fs')

module.exports = {
  up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   let shoesData = JSON.parse(fs.readFileSync('./data/shoes.json', 'utf-8'))
   let shoesDataFix = shoesData.map(el => {
    const {name, usedBy, description, photo, price, BrandId} = el ;
    return {
      name, usedBy, description, photo, price, BrandId,
      createdAt: new Date(),
      updatedAt: new Date(),
      stock: 10
    }
   })
   return queryInterface.bulkInsert("Shoes", shoesDataFix, {})
  },

  down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     return queryInterface.bulkDelete("Shoes", null, {})
  }
};
