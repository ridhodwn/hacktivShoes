'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Shoe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Shoe.belongsTo(models.Brand, {
        foreignKey: "BrandId"
      })
      Shoe.belongsToMany(models.User, { through: 'Transactions' });
    }
  }
  Shoe.init({
    name: DataTypes.STRING,
    usedBy: DataTypes.STRING,
    description: DataTypes.TEXT,
    photo: DataTypes.TEXT,
    price: DataTypes.INTEGER,
    BrandId: DataTypes.INTEGER,
    stock: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Shoe',
  });
  return Shoe;
};