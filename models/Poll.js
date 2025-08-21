const supabase = require('../config/database');

const Poll = {
  async create(data) {
    const { data: poll, error } = await supabase
      .from('polls')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return poll;
  },

  async findByUserId(userId) {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('polls')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }
};

module.exports = Poll;
