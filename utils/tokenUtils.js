const jwt = require('jsonwebtoken');
require('dotenv').config();

// Secret keys for signing tokens (you can use different keys)
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

// Generate an access token
const generateAccessToken = (payload) => {
  return jwt.sign(payload, accessTokenSecret, {expiresIn: "15m"});
};

// Generate a refresh token
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, refreshTokenSecret, { expiresIn: "7d" });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
