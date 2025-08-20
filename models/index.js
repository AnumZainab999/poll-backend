const sequelize = require('../config/db');

const initUser = require('./User');
const initPoll = require('./Poll');
const initOption = require('./Option');
const initVote = require('./Vote');
const initComment = require('./Comment');

// Init models
const User = initUser(sequelize);
const Poll = initPoll(sequelize);
const Option = initOption(sequelize);
const Vote = initVote(sequelize);
const Comment = initComment(sequelize);

// Associations
User.hasMany(Poll, { foreignKey: 'userId' });
Poll.belongsTo(User, { foreignKey: 'userId' });

Poll.hasMany(Option, { foreignKey: 'pollId', onDelete: 'CASCADE' });
Option.belongsTo(Poll, { foreignKey: 'pollId' });

User.belongsToMany(Option, { through: Vote, foreignKey: 'userId' });
Option.belongsToMany(User, { through: Vote, foreignKey: 'optionId' });

Vote.belongsTo(User, { foreignKey: 'userId' });
Vote.belongsTo(Option, { foreignKey: 'optionId' });
Vote.belongsTo(Poll, { foreignKey: 'pollId' });
Poll.hasMany(Vote, { foreignKey: 'pollId', onDelete: 'CASCADE' });

Poll.hasMany(Comment, { foreignKey: 'pollId', onDelete: 'CASCADE' });
Comment.belongsTo(Poll, { foreignKey: 'pollId' });
User.hasMany(Comment, { foreignKey: 'userId', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Poll,
  Option,
  Vote,
  Comment
};
