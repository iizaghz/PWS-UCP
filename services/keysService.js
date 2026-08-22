const crypto = require('crypto');
const keyRepository = require('../repositories/keyRepository');

function generateApiKey(environment = 'live') {
  const prefix = environment === 'test' ? 'cd_test_' : 'cd_live_';
  const randomBytes = crypto.randomBytes(16).toString('hex');
  const apiKey = `${prefix}${randomBytes}`;
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  return { apiKey, prefix, keyHash };
}

async function createKey(userId, { name, environment = 'live', expires_in_days = 365 }) {
  const { apiKey, prefix, keyHash } = generateApiKey(environment);
  const expiresAt = expires_in_days ? new Date(Date.now() + expires_in_days * 24 * 3600 * 1000) : null;

  const newKeyRecord = await keyRepository.create({
    userId,
    name: name || 'API Key',
    prefix,
    keyHash,
    environment,
    expiresAt
  });

  return {
    key: newKeyRecord,
    apiKeySecret: apiKey
  };
}

async function getUserKeys(userId) {
  return keyRepository.findByUserId(userId);
}

async function getKeyById(userId, keyId) {
  const key = await keyRepository.findByIdAndUserId(keyId, userId);
  if (!key) {
    const err = new Error('API Key not found');
    err.code = 'KEY_NOT_FOUND';
    err.statusCode = 404;
    throw err;
  }
  return key;
}

async function revokeKey(userId, keyId) {
  const key = await getKeyById(userId, keyId);
  await keyRepository.revoke(keyId);
  return { ...key, is_active: false };
}

async function deleteKey(userId, keyId) {
  await getKeyById(userId, keyId);
  await keyRepository.deleteById(keyId);
  return { message: 'API Key deleted successfully' };
}

module.exports = {
  createKey,
  getUserKeys,
  getKeyById,
  revokeKey,
  deleteKey
};
