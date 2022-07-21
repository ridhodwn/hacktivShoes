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
    name: {
      type:DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull:{
          msg: `Shoe name cannot be empty!`
        },
        notEmpty:{
          msg: `Shoe name cannot be empty!`
        }
      }
    },
    usedBy: {
      type:DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull:{
          msg: `Athlete that endorse the shoes cannot be empty!`
        },
        notEmpty:{
          msg: `Athlete that endorse the shoes cannot be empty!`
        }
      }
    },
    description: {
      type:DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull:{
          msg: `Please fill the shoe description!`
        },
        notEmpty:{
          msg: `Please fill the shoe description!`
        }
      }
    },
    photo: {
      type:DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull:{
          msg: `Please provide URL for shoe's photo!`
        },
        notEmpty:{
          msg: `Please provide URL for shoe's photo!`
        }
      }
    },
    price: {
      type:DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull:{
          msg: `Price cannot be empty!`
        },
        notEmpty:{
          msg: `Price cannot be empty!`
        }, min: {
          args: [100000],
          msg: `Minimum price is Rp 100.000!`
        }
      }
    },
    BrandId: {
      type:DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull:{
          msg: `Please fill the brand of the shoe!`
        },
        notEmpty:{
          msg: `Please fill the brand of the shoe!`
        }
      }
    },
    stock: {
      type:DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull:{
          msg: `Stock amount cannot be empty!`
        },
        notEmpty:{
          msg: `Stock amount cannot be empty!`
        }, min: {
          args: [0],
          msg: `Minimum stock is 0 pair!`
        }
      }
    },
  }, {
    sequelize,
    modelName: 'Shoe',
  });
  return Shoe;
};