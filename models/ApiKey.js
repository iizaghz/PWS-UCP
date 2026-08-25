const keyRepository = require('../repositories/keyRepository');

class ApiKey {
  constructor(data = {}) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.name = data.name;
    this.key_prefix = data.key_prefix;
    this.key_hash = data.key_hash;
    this.environment = data.environment || 'live';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.expires_at = data.expires_at;
    this.last_used_at = data.last_used_at;
    this.created_at = data.created_at;
  }

  static async findByHash(keyHash) {
    const raw = await keyRepository.findByHash(keyHash);
    return raw ? new ApiKey(raw) : null;
  }

  static async findByUserId(userId) {
    const list = await keyRepository.findByUserId(userId);
    return list.map(item => new ApiKey(item));
  }

  static async findByIdAndUserId(keyId, userId) {
    const raw = await keyRepository.findByIdAndUserId(keyId, userId);
    return raw ? new ApiKey(raw) : null;
  }

  static async create(keyData) {
    const raw = await keyRepository.create(keyData);
    return new ApiKey(raw);
  }

  static async revoke(keyId) {
    return await keyRepository.revoke(keyId);
  }

  static async deleteById(keyId) {
    return await keyRepository.deleteById(keyId);
  }
}

module.exports = ApiKey;
