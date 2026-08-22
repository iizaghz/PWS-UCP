const keysService = require('../services/keysService');
const { success, error } = require('../utils/response');
const { createKeySchema } = require('../validators/keyValidator');

async function createKey(req, res) {
  try {
    const parseResult = createKeySchema.safeParse(req.body);
    if (!parseResult.success) {
      return error(res, 'VALIDATION_ERROR', parseResult.error.errors[0].message, 400);
    }

    const result = await keysService.createKey(req.user.id, parseResult.data);
    return success(res, {
      id: result.key.id,
      name: result.key.name,
      api_key: result.apiKeySecret, // Displayed ONLY ONCE
      key_prefix: result.key.key_prefix,
      environment: result.key.environment,
      is_active: result.key.is_active,
      expires_at: result.key.expires_at,
      created_at: result.key.created_at,
      message: 'Store this API Key securely. It will not be shown again!'
    }, undefined, 201);
  } catch (err) {
    return error(res, err.code || 'CREATE_KEY_FAILED', err.message, err.statusCode || 500);
  }
}

async function listKeys(req, res) {
  try {
    const keys = await keysService.getUserKeys(req.user.id);
    return success(res, keys);
  } catch (err) {
    return error(res, err.code || 'LIST_KEYS_FAILED', err.message, err.statusCode || 500);
  }
}

async function getKey(req, res) {
  try {
    const key = await keysService.getKeyById(req.user.id, req.params.id);
    return success(res, key);
  } catch (err) {
    return error(res, err.code || 'KEY_NOT_FOUND', err.message, err.statusCode || 404);
  }
}

async function revokeKey(req, res) {
  try {
    const key = await keysService.revokeKey(req.user.id, req.params.id);
    return success(res, key);
  } catch (err) {
    return error(res, err.code || 'REVOKE_FAILED', err.message, err.statusCode || 500);
  }
}

async function deleteKey(req, res) {
  try {
    const result = await keysService.deleteKey(req.user.id, req.params.id);
    return success(res, result);
  } catch (err) {
    return error(res, err.code || 'DELETE_FAILED', err.message, err.statusCode || 500);
  }
}

module.exports = {
  createKey,
  listKeys,
  getKey,
  revokeKey,
  deleteKey
};
