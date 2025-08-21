const supabase = require('../config/database');

const Vote = {
  async create(data) {
    const { data: vote, error } = await supabase
      .from('votes')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return vote;
  },

  async findByUserId(userId) {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  }
};

module.exports = Vote;
