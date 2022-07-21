'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    totalPrice(price, amount){
      return Number(amount) * (price) ;
    }
  }
  Transactions.init({
    ShoeId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER,
    amount: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Transactions',
  });
  return Transactions;
};