const supabase = require('../config/database');

// ✅ Create Poll
exports.createPoll = async (req, res) => {
  try {
    const { question, options, expiresAt } = req.body;
    if (!question || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ message: 'Question and at least 2 options required' });
    }

    // create poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert([{ question, user_id: req.user.id, expires_at: expiresAt || null }])
      .select('*')
      .single();

    if (pollError) throw pollError;

    // create options
    const optPayload = options.map((text) => ({ text, poll_id: poll.id }));
    const { data: createdOptions, error: optError } = await supabase
      .from('options')
      .insert(optPayload)
      .select('*');

    if (optError) throw optError;

    // fetch user info
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    res.status(201).json({
      message: 'Poll created',
      data: { ...poll, options: createdOptions, user },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get Active Polls
exports.getActivePolls = async (req, res) => {
  try {
    const { data: polls, error } = await supabase
      .from('polls')
      .select('*')
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const result = await Promise.all(
      polls.map(async (poll) => {
        const { data: options } = await supabase.from('options').select('*').eq('poll_id', poll.id);
        const { data: user } = await supabase.from('users').select('*').eq('id', poll.user_id).single();
        return { ...poll, options, user };
      })
    );

    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get Poll By Id
exports.getPollById = async (req, res) => {
  try {
    const { data: poll } = await supabase.from('polls').select('*').eq('id', req.params.id).single();
    if (!poll) return res.status(404).json({ message: 'Poll not found' });

    const { data: options } = await supabase.from('options').select('*').eq('poll_id', poll.id);
    const { data: user } = await supabase.from('users').select('*').eq('id', poll.user_id).single();

    res.json({ data: { ...poll, options, user } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Delete Poll
exports.deletePoll = async (req, res) => {
  try {
    const { data: poll } = await supabase.from('polls').select('*').eq('id', req.params.id).single();
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    if (poll.user_id !== req.user.id) return res.status(403).json({ message: 'Not allowed' });

    await supabase.from('polls').delete().eq('id', poll.id);
    res.json({ message: 'Poll deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Vote On Poll
exports.voteOnPoll = async (req, res) => {
  try {
    const pollId = parseInt(req.params.id);
    const { optionId } = req.body;

    const { data: poll } = await supabase.from('polls').select('*').eq('id', pollId).single();
    if (!poll) return res.status(404).json({ message: 'Poll not found' });
    if (poll.expires_at && new Date(poll.expires_at) <= new Date()) {
      return res.status(400).json({ message: 'Poll expired' });
    }

    const { data: option } = await supabase
      .from('options')
      .select('*')
      .eq('id', optionId)
      .eq('poll_id', pollId)
      .single();
    if (!option) return res.status(400).json({ message: 'Invalid option for this poll' });

    const { data: existing } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('poll_id', pollId)
      .single();
    if (existing) return res.status(400).json({ message: 'User already voted' });

    await supabase.from('votes').insert([{ user_id: req.user.id, option_id: option.id, poll_id: pollId }]);

    const { data: options } = await supabase
      .from('options')
      .select('id, text, (SELECT COUNT(*) FROM votes WHERE option_id = options.id) AS votes')
      .eq('poll_id', pollId);

    req.io?.to(`poll:${pollId}`).emit('pollUpdated', { pollId, options });

    res.json({ message: 'Vote recorded', data: { pollId, options } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Get Poll Stats
exports.getPollStats = async (req, res) => {
  try {
    const pollId = parseInt(req.params.id);
    const { data: options } = await supabase
      .from('options')
      .select('id, text, (SELECT COUNT(*) FROM votes WHERE option_id = options.id) AS votes')
      .eq('poll_id', pollId);

    res.json({ data: options });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};