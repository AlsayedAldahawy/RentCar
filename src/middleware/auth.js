const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Extract only required fields from token
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    console.log(req.user.role)
    req.user.role === 'superadmin' || req.user.role === 'moderator' ? req.user.type = decoded.type: null;
    console.log(req.user.type)

    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authenticateToken;
