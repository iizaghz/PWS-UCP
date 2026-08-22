const { verifyToken } = require('../utils/auth');
const { error } = require('../utils/response');

function authenticateJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'UNAUTHORIZED', 'Missing or invalid Authorization Bearer header', 401);
  }

  const token = authHeader.substring(7).trim();
  const decoded = verifyToken(token);

  if (!decoded) {
    return error(res, 'INVALID_TOKEN', 'JWT token is invalid or expired', 401);
  }

  req.user = decoded;
  next();
}

module.exports = {
  authenticateJwt
};
