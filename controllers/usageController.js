const usageService = require('../services/usageService');
const { success, error } = require('../utils/response');

async function getUsage(req, res) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    const logs = await usageService.getUsageLogs(req.user.id, limit);
    return success(res, logs);
  } catch (err) {
    return error(res, 'FETCH_USAGE_FAILED', err.message, 500);
  }
}

async function getStats(req, res) {
  try {
    const stats = await usageService.getUsageStats(req.user.id);
    return success(res, stats);
  } catch (err) {
    return error(res, 'FETCH_STATS_FAILED', err.message, 500);
  }
}

async function getEndpoints(req, res) {
  try {
    const endpoints = await usageService.getEndpointBreakdown(req.user.id);
    return success(res, endpoints);
  } catch (err) {
    return error(res, 'FETCH_ENDPOINTS_FAILED', err.message, 500);
  }
}

module.exports = {
  getUsage,
  getStats,
  getEndpoints
};
