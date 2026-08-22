const db = require('../config/db');

async function getUsageLogs(userId, limit = 50) {
  const isPg = db.getIsConnected();
  if (isPg) {
    const res = await db.query(
      `SELECT u.id, u.endpoint, u.method, u.status_code, u.response_time, u.ip_address, u.user_agent, u.requested_at, k.name as key_name, k.key_prefix
       FROM api_usage u
       JOIN api_keys k ON u.api_key_id = k.id
       WHERE k.user_id = $1
       ORDER BY u.requested_at DESC
       LIMIT $2;`,
      [userId, limit]
    );
    return res.rows;
  } else {
    const userKeyIds = db.memoryDb.api_keys.filter(k => k.user_id === userId).map(k => k.id);
    return db.memoryDb.api_usage
      .filter(u => userKeyIds.includes(u.api_key_id))
      .sort((a, b) => new Date(b.requested_at) - new Date(a.requested_at))
      .slice(0, limit)
      .map(u => {
        const k = db.memoryDb.api_keys.find(x => x.id === u.api_key_id);
        return {
          ...u,
          key_name: k ? k.name : 'Unknown',
          key_prefix: k ? k.key_prefix : 'cd_live_'
        };
      });
  }
}

async function getUsageStats(userId) {
  const isPg = db.getIsConnected();
  if (isPg) {
    const statsRes = await db.query(
      `SELECT 
         COUNT(u.id) as total_requests,
         COUNT(CASE WHEN u.status_code >= 200 AND u.status_code < 400 THEN 1 END) as successful_requests,
         COUNT(CASE WHEN u.status_code >= 400 THEN 1 END) as failed_requests,
         ROUND(AVG(u.response_time), 2) as avg_response_time
       FROM api_usage u
       JOIN api_keys k ON u.api_key_id = k.id
       WHERE k.user_id = $1;`,
      [userId]
    );

    const keysCountRes = await db.query(
      `SELECT COUNT(id) as active_keys FROM api_keys WHERE user_id = $1 AND is_active = true;`,
      [userId]
    );

    const topEndpointRes = await db.query(
      `SELECT u.endpoint, COUNT(u.id) as count
       FROM api_usage u
       JOIN api_keys k ON u.api_key_id = k.id
       WHERE k.user_id = $1
       GROUP BY u.endpoint
       ORDER BY count DESC
       LIMIT 1;`,
      [userId]
    );

    const row = statsRes.rows[0];
    const total = parseInt(row.total_requests || 0);
    const successCount = parseInt(row.successful_requests || 0);
    const failedCount = parseInt(row.failed_requests || 0);
    const successRate = total > 0 ? ((successCount / total) * 100).toFixed(1) + '%' : '100%';

    return {
      total_requests: total,
      successful_requests: successCount,
      failed_requests: failedCount,
      success_rate: successRate,
      average_response_time: parseFloat(row.avg_response_time || 0) + ' ms',
      active_api_keys: parseInt(keysCountRes.rows[0].active_keys || 0),
      most_used_endpoint: topEndpointRes.rows[0] ? topEndpointRes.rows[0].endpoint : '/api/v1/movies'
    };
  } else {
    const userKeys = db.memoryDb.api_keys.filter(k => k.user_id === userId);
    const userKeyIds = userKeys.map(k => k.id);
    const logs = db.memoryDb.api_usage.filter(u => userKeyIds.includes(u.api_key_id));

    const total = logs.length;
    const successCount = logs.filter(l => l.status_code >= 200 && l.status_code < 400).length;
    const failedCount = logs.filter(l => l.status_code >= 400).length;
    const avgTime = total > 0 ? (logs.reduce((acc, curr) => acc + curr.response_time, 0) / total).toFixed(2) : 0;
    const activeKeysCount = userKeys.filter(k => k.is_active).length;

    const endpointCounts = {};
    logs.forEach(l => {
      endpointCounts[l.endpoint] = (endpointCounts[l.endpoint] || 0) + 1;
    });

    let topEndpoint = '/api/v1/movies';
    let maxCount = 0;
    Object.entries(endpointCounts).forEach(([ep, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topEndpoint = ep;
      }
    });

    return {
      total_requests: total,
      successful_requests: successCount,
      failed_requests: failedCount,
      success_rate: total > 0 ? ((successCount / total) * 100).toFixed(1) + '%' : '100%',
      average_response_time: `${avgTime} ms`,
      active_api_keys: activeKeysCount,
      most_used_endpoint: topEndpoint
    };
  }
}

async function getEndpointBreakdown(userId) {
  const isPg = db.getIsConnected();
  if (isPg) {
    const res = await db.query(
      `SELECT u.endpoint, COUNT(u.id) as total_calls, ROUND(AVG(u.response_time), 2) as avg_time
       FROM api_usage u
       JOIN api_keys k ON u.api_key_id = k.id
       WHERE k.user_id = $1
       GROUP BY u.endpoint
       ORDER BY total_calls DESC;`,
      [userId]
    );
    return res.rows;
  } else {
    const userKeyIds = db.memoryDb.api_keys.filter(k => k.user_id === userId).map(k => k.id);
    const logs = db.memoryDb.api_usage.filter(u => userKeyIds.includes(u.api_key_id));
    const breakdownMap = {};

    logs.forEach(l => {
      if (!breakdownMap[l.endpoint]) {
        breakdownMap[l.endpoint] = { total_calls: 0, total_time: 0 };
      }
      breakdownMap[l.endpoint].total_calls++;
      breakdownMap[l.endpoint].total_time += l.response_time;
    });

    return Object.entries(breakdownMap).map(([endpoint, data]) => ({
      endpoint,
      total_calls: data.total_calls,
      avg_time: (data.total_time / data.total_calls).toFixed(2)
    })).sort((a, b) => b.total_calls - a.total_calls);
  }
}

module.exports = {
  getUsageLogs,
  getUsageStats,
  getEndpointBreakdown
};
