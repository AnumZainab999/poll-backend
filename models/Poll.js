const { DataTypes, Model } = require('sequelize');

class Poll extends Model {}

function initPoll(sequelize) {
  Poll.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    question: { type: DataTypes.STRING(255), allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  }, {
    sequelize,
    modelName: 'Poll',
    timestamps: true
  });

  return Poll;
}

module.exports = initPoll;
