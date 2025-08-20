const { DataTypes, Model } = require('sequelize');

class User extends Model {
  static associate(models) {
    this.hasMany(models.Poll, { foreignKey: 'userId' });
    this.hasMany(models.Comment, { foreignKey: 'userId', onDelete: 'CASCADE' });
  }
}

function initModel(sequelize) {
  User.init({
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING(60), allowNull: false },
    email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(200), allowNull: false },
    avatarUrl: { type: DataTypes.STRING(255) },
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true
  });
  return User;
}

module.exports = initModel;
