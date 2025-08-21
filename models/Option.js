const supabase = require('../config/database');

const Option = {
  async create(data) {
    const { data: option, error } = await supabase
      .from('options')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return option;
  },

  async findByPollId(pollId) {
    const { data, error } = await supabase
      .from('options')
      .select('*')
      .eq('poll_id', pollId);
    if (error) throw error;
    return data;
  }
};

module.exports = Option;
