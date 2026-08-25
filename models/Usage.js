const db = require('../config/db');

class Usage {
  constructor(data = {}) {
    this.id = data.id;
    this.api_key_id = data.api_key_id;
    this.endpoint = data.endpoint;
    this.method = data.method;
    this.status_code = data.status_code;
    this.response_time = data.response_time;
    this.ip_address = data.ip_address;
    this.user_agent = data.user_agent;
    this.requested_at = data.requested_at;
  }

  static async log(logData) {
    const { apiKeyId, endpoint, method, statusCode, responseTime, ipAddress, userAgent } = logData;
    const isPg = db.getIsConnected();

    if (isPg) {
      await db.query(
        `INSERT INTO api_usage (api_key_id, endpoint, method, status_code, response_time, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7);`,
        [apiKeyId, endpoint, method, statusCode, responseTime, ipAddress, userAgent]
      );
      if (apiKeyId) {
        await db.query(`UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1;`, [apiKeyId]);
      }
    } else {
      const entry = {
        id: db.memoryDb.autoIds.api_usage++,
        api_key_id: apiKeyId,
        endpoint,
        method,
        status_code: statusCode,
        response_time: responseTime,
        ip_address: ipAddress,
        user_agent: userAgent,
        requested_at: new Date()
      };
      db.memoryDb.api_usage.push(entry);
      if (apiKeyId) {
        const k = db.memoryDb.api_keys.find(x => x.id === apiKeyId);
        if (k) k.last_used_at = new Date();
      }
    }
  }
}

module.exports = Usage;
