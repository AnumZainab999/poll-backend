const { DataTypes, Model } = require('sequelize');

class Option extends Model {}

function initOption(sequelize) {
  Option.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    text: { type: DataTypes.STRING(200), allowNull: false },
    pollId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  }, {
    sequelize,
    modelName: 'Option',
    timestamps: true
  });

  return Option;
}

module.exports = initOption;
