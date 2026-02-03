const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const userRepository = require('../repositories/userRepository');

const login = async (email, password) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  let isMatch = false;
  if (user.password_hash && user.password_hash.startsWith('$2')) {
    isMatch = await bcrypt.compare(password, user.password_hash);
  } else {
    isMatch = password === user.password_hash;
  }
  if (!isMatch) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };

  const token = jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

  return { user: payload, token };
};

const verifyToken = async (token) => {
  try {
    return jwt.verify(token, env.jwt.secret);
  } catch (err) {
    const error = new Error('Invalid token');
    error.status = 401;
    throw error;
  }
};

module.exports = {
  login,
  verifyToken
};
