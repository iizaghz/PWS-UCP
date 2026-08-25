const userRepository = require('../repositories/userRepository');

class User {
  constructor(data = {}) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.created_at = data.created_at;
  }

  static async findByEmail(email) {
    const raw = await userRepository.findByEmail(email);
    return raw ? new User(raw) : null;
  }

  static async findById(id) {
    const raw = await userRepository.findById(id);
    return raw ? new User(raw) : null;
  }

  static async create(userData) {
    const raw = await userRepository.create(userData);
    return new User(raw);
  }
}

module.exports = User;
