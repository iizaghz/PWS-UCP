const authService = require('../services/authService');
const { success, error } = require('../utils/response');
const { registerSchema, loginSchema } = require('../validators/authValidator');

async function register(req, res) {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return error(res, 'VALIDATION_ERROR', parseResult.error.errors[0].message, 400);
    }

    const data = await authService.register(parseResult.data);
    return success(res, data, undefined, 201);
  } catch (err) {
    return error(res, err.code || 'REGISTER_FAILED', err.message, err.statusCode || 500);
  }
}

async function login(req, res) {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return error(res, 'VALIDATION_ERROR', parseResult.error.errors[0].message, 400);
    }

    const data = await authService.login(parseResult.data);
    return success(res, data);
  } catch (err) {
    return error(res, err.code || 'LOGIN_FAILED', err.message, err.statusCode || 500);
  }
}

async function me(req, res) {
  try {
    const user = await authService.getUserProfile(req.user.id);
    return success(res, { user });
  } catch (err) {
    return error(res, err.code || 'USER_NOT_FOUND', err.message, err.statusCode || 404);
  }
}

async function logout(req, res) {
  return success(res, { message: 'Logged out successfully' });
}

module.exports = {
  register,
  login,
  me,
  logout
};
