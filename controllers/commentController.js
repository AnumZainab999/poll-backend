const { Comment, User, Poll } = require('../models');

exports.getComments = async (req, res) => {
  try {
    const { pollId } = req.params;
    const comments = await Comment.findAll({
      where: { pollId },
      include: [{ model: User, attributes: ['id','username','avatarUrl'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json({ data: comments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text required' });

    const poll = await Poll.findByPk(pollId);
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    const comment = await Comment.create({ pollId, userId: req.user.id, text });
    const payload = await Comment.findByPk(comment.id, { include: [{ model: User, attributes: ['id','username','avatarUrl'] }] });

    // broadcast
    req.io.to(`poll:${pollId}`).emit('newComment', { pollId, comment: payload });

    res.status(201).json({ message: 'Comment added', data: payload });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};