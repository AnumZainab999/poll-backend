const { Comment, User, Poll } = require('../models');
const supabase = require('../config/database');

exports.getComments = async (req, res) => {
  try {
    const { pollId } = req.params;

    // fetch comments for poll
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('poll_id', pollId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // attach user info for each comment
    const result = await Promise.all(comments.map(async (c) => {
      const user = await User.findById(c.user_id);
      return { ...c, user };
    }));

    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text required' });

    // check poll existence
    const poll = await Poll.findById(parseInt(pollId));
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    // create comment
    const comment = await Comment.create({ poll_id: pollId, user_id: req.user.id, text });

    // attach user info
    const user = await User.findById(req.user.id);
    const payload = { ...comment, user };

    // broadcast via socket
    req.io?.to(`poll:${pollId}`).emit('newComment', { pollId, comment: payload });

    res.status(201).json({ message: 'Comment added', data: payload });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
