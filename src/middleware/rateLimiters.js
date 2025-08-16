// middlewares/rateLimiters.js
const rateLimit = require('express-rate-limit');

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many password reset attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  resetPasswordLimiter
};
