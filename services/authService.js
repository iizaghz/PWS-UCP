const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { generateToken } = require('../utils/auth');

async function register({ name, email, password }) {
  const existing = await userRepository.findByEmail(email);

  if (existing) {
    const err = new Error('Email is already registered');
    err.code = 'EMAIL_EXISTS';
    err.statusCode = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = await userRepository.create({ name, email, password_hash });

  const token = generateToken({ id: user.id, email: user.email, name: user.name });
  return {
    user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at },
    token
  };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    const err = new Error('Email tidak ditemukan. Silakan periksa kembali email Anda.');
    err.code = 'EMAIL_NOT_FOUND';
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const err = new Error('Password salah. Silakan periksa kembali password Anda.');
    err.code = 'INVALID_PASSWORD';
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken({ id: user.id, email: user.email, name: user.name });
  return {
    user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at },
    token
  };
}

async function getUserProfile(userId) {
  const user = await userRepository.findById(userId);

  if (!user) {
    const err = new Error('User not found');
    err.code = 'USER_NOT_FOUND';
    err.statusCode = 404;
    throw err;
  }

  return user;
}

module.exports = {
  register,
  login,
  getUserProfile
};
