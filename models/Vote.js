const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Vote', {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    optionId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    pollId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  }, {
    timestamps: true,
    indexes: [
      { unique: true, fields: ['userId', 'pollId'] },
    ],
  });
};
