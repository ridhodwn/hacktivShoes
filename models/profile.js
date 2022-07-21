'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Profile.belongsTo(models.User, {
        foreignKey: {
          name: 'UserId'
        }
      });
    }
  }
  Profile.init({
    name: {
      type:DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull:{
          msg: `Profile name cannot be empty!`
        },
        notEmpty:{
          msg: `Profile name cannot be empty!`
        }
      }
    },
    address: {
      type:DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull:{
          msg: `Please fill your residential address!`
        },
        notEmpty:{
          msg: `Please fill your residential address!`
        }
      }
    },
    city: {
      type:DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull:{
          msg: `Information of residential city is required!`
        },
        notEmpty:{
          msg: `Information of residential city is required!`
        }
      }
    },
    state: {
      type:DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull:{
          msg: `Information of residential state is required!`
        },
        notEmpty:{
          msg: `Information of residential state is required!`
        }
      }
    },
    country: {
      type:DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull:{
          msg: `Information of residential country is required!`
        },
        notEmpty:{
          msg: `Information of residential country is required!`
        }
      }
    },
    postalCode: {
      type:DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull:{
          msg: `Information of residential postal code is required!`
        },
        notEmpty:{
          msg: `Information of residential postal code is required!`
        }
      }
    },
    photo: {
      type:DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull:{
          msg: `Please provide photo URL!`
        },
        notEmpty:{
          msg: `Please provide photo URL!`
        }
      }
    },
    UserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Profile',
  });
  return Profile;
};