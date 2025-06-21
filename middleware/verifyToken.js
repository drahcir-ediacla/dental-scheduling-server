const jwt = require('jsonwebtoken');
require('dotenv').config();


const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

const verifyToken = (req, res, next) => {
  const token = req.cookies?.accessJwt;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token not found' });
  }

  try {
    const decoded = jwt.verify(token, accessTokenSecret);
    req.user = decoded; // attach decoded user info to request
    next();
  } catch (error) {
    console.error('JWT verification failed:', error.message);
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;
