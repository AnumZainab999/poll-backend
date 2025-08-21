const supabase = require('../config/database');

const User = {
  async create(data) {
    const { data: user, error } = await supabase
      .from('users')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return user;
  },

  async findByEmail(email) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error) throw error;
    return user;
  },

  async findById(id) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return user;
  }
};

module.exports = User;
