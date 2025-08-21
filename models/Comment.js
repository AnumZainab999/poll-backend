const supabase = require('../config/database');

const Comment = {
  async create(data) {
    const { data: comment, error } = await supabase
      .from('comments')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return comment;
  },

  async findByPollId(pollId) {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('poll_id', pollId);
    if (error) throw error;
    return data;
  }
};

module.exports = Comment;
