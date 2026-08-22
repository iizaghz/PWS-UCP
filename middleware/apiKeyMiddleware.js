const crypto = require('crypto');
const db = require('../config/db');
const keyRepository = require('../repositories/keyRepository');
const { error } = require('../utils/response');

const rateLimitTracker = new Map();

async function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey) {
    return error(res, 'MISSING_API_KEY', 'API key is required. Pass it in header "x-api-key"', 401);
  }

  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

  try {
    const keyRecord = await keyRepository.findByHash(keyHash);

    if (!keyRecord) {
      return error(res, 'INVALID_API_KEY', 'API key is invalid', 401);
    }

    if (!keyRecord.is_active) {
      return error(res, 'INACTIVE_API_KEY', 'API key is inactive or revoked', 403);
    }

    if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
      return error(res, 'EXPIRED_API_KEY', 'API key has expired', 401);
    }

    // Rate Limiting Logic (Free: 100/hr, Dev: 1000/hr, Enterprise: 10000/hr)
    const env = keyRecord.environment || 'live';
    const limit = env === 'enterprise' ? 10000 : env === 'developer' ? 1000 : 100;
    const now = Date.now();
    const windowMs = 60 * 60 * 1000;

    let tracker = rateLimitTracker.get(keyRecord.id);
    if (!tracker || (now - tracker.startTime > windowMs)) {
      tracker = { count: 1, startTime: now };
    } else {
      tracker.count++;
    }
    rateLimitTracker.set(keyRecord.id, tracker);

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - tracker.count));
    res.setHeader('X-RateLimit-Reset', new Date(tracker.startTime + windowMs).toISOString());

    if (tracker.count > limit) {
      return error(res, 'RATE_LIMIT_EXCEEDED', `Rate limit of ${limit} requests per hour exceeded`, 429);
    }

    req.apiKey = keyRecord;
    const startTime = Date.now();

    res.on('finish', async () => {
      const responseTime = Date.now() - startTime;
      const endpoint = req.originalUrl || req.url;
      const method = req.method;
      const statusCode = res.statusCode;
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';

      try {
        const isPg = db.getIsConnected();
        if (isPg) {
          await db.query(
            `UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1;`,
            [keyRecord.id]
          );

          await db.query(
            `INSERT INTO api_usage (api_key_id, endpoint, method, status_code, response_time, ip_address, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6, $7);`,
            [keyRecord.id, endpoint, method, statusCode, responseTime, ip, userAgent]
          );
        } else {
          keyRecord.last_used_at = new Date();
          db.memoryDb.api_usage.push({
            id: db.memoryDb.autoIds.api_usage++,
            api_key_id: keyRecord.id,
            endpoint,
            method,
            status_code: statusCode,
            response_time: responseTime,
            ip_address: ip,
            user_agent: userAgent,
            requested_at: new Date()
          });
        }
      } catch (logErr) {
        console.error('[API Key Middleware] Error logging usage:', logErr.message);
      }
    });

    next();
  } catch (err) {
    console.error('[API Key Middleware] Internal Error:', err);
    return error(res, 'SERVER_ERROR', 'Internal server authentication error', 500);
  }
}

module.exports = {
  authenticateApiKey
};
