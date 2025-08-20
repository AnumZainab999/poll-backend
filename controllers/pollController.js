const { sequelize, Poll, Option, Vote, User } = require('../models');

exports.createPoll = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { question, options, expiresAt } = req.body;
    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'Question and at least 2 options required' });
    }

    const poll = await Poll.create({ question, userId: req.user.id, expiresAt: expiresAt || null }, { transaction: t });
    const optPayload = options.map((text) => ({ text, pollId: poll.id }));
    await Option.bulkCreate(optPayload, { transaction: t });

    await t.commit();

    const created = await Poll.findByPk(poll.id, { include: [ { model: Option }, { model: User, attributes: ['id','username','avatarUrl'] } ] });
    res.status(201).json({ message: 'Poll created', data: created });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

exports.getActivePolls = async (req, res) => {
  try {
    const now = new Date();
    const polls = await Poll.findAll({
      where: sequelize.where(
        sequelize.literal('(expiresAt IS NULL OR expiresAt > NOW())'),
        true
      ),
      include: [ { model: Option }, { model: User, attributes: ['id','username','avatarUrl'] } ],
      order: [['createdAt','DESC']]
    });
    res.json({ data: polls });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPollById = async (req, res) => {
  try {
    const poll = await Poll.findByPk(req.params.id, { include: [ Option, { model: User, attributes: ['id','username','avatarUrl'] } ] });
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    res.json({ data: poll });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findByPk(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    if (poll.userId !== req.user.id) return res.status(403).json({ message: 'Not allowed' });
    await poll.destroy();
    res.json({ message: 'Poll deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.voteOnPoll = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const pollId = parseInt(req.params.id, 10);
    const { optionId } = req.body;

    // check poll existence & expiry
    const poll = await Poll.findByPk(pollId);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    if (poll.expiresAt && new Date(poll.expiresAt) <= new Date()) {
      return res.status(400).json({ message: 'Poll expired' });
    }

    // ensure option belongs to poll
    const option = await Option.findOne({ where: { id: optionId, pollId } });
    if (!option) return res.status(400).json({ message: 'Invalid option for this poll' });

    // unique vote per user per poll
    const existing = await Vote.findOne({ where: { userId: req.user.id, pollId } });
    if (existing) return res.status(400).json({ message: 'User already voted' });

    // record vote
    await Vote.create({ userId: req.user.id, optionId: option.id, pollId }, { transaction: t });
    await t.commit();

    // fetch updated counts
    const options = await Option.findAll({
      where: { pollId },
      attributes: ['id', 'text', [sequelize.literal(`(
        SELECT COUNT(*) FROM Votes v WHERE v.optionId = Option.id
      )`), 'votes']]
    });

    // emit real-time update to room
    req.io.to(`poll:${pollId}`).emit('pollUpdated', { pollId, options });

    res.json({ message: 'Vote recorded', data: { pollId, options } });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};


exports.getPollStats = async (req, res) => {
  const { id } = req.params;
  const options = await Option.findAll({
    where: { pollId: id },
    attributes: ['id', 'text', [sequelize.literal(`(SELECT COUNT(*) FROM Votes v WHERE v.optionId = Option.id)`), 'votes']]
  });
  res.json({ data: options });
};