'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.Profile)
      User.belongsToMany(models.Shoe, { through: 'Transactions' });
    }

    static generateCaption(name, shoesAmount){
      return `Hello ${name}! You have ${shoesAmount} pair(s) of shoes waiting to be checked out!`
    }

    static generateOrderNumber(id){
      return `${new Date().getTime()}${id}`
    }
  }
  User.init({
    username: {
      type:DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull:{
          msg: `Username cannot be empty!`
        },
        notEmpty:{
          msg: `Username cannot be empty!`
        },
        oneWord(username){
          let usernameSplitted = username.split(' ') ;
          if(usernameSplitted.length > 1){
            throw new Error('One-word username is mandatory!');
          }
        },
        isAlphanumeric: {
          msg: `Unique characters are not allowed!`
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull:{
          msg: `Email cannot be empty!`
        },
        notEmpty:{
          msg: `Email cannot be empty!`
        }
      }
    },
    password: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });

  User.beforeCreate(user => {
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(user.password, salt);
    user.password = hash
  })
  return User;
};