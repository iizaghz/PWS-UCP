/**
 * Standard Response Helpers for CineData API
 */

function success(res, data, meta = undefined, statusCode = 200) {
  const responseBody = {
    success: true,
    data
  };
  if (meta !== undefined) {
    responseBody.meta = meta;
  }
  return res.status(statusCode).json(responseBody);
}

function error(res, code, message, statusCode = 400, details = undefined) {
  const errorObj = {
    code,
    message
  };
  if (details) {
    errorObj.details = details;
  }
  return res.status(statusCode).json({
    success: false,
    error: errorObj
  });
}

module.exports = {
  success,
  error
};
