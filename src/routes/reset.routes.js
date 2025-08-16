// src/routes/verify.routes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const {resetPasswordLimiter} = require('../middleware/rateLimiters')



// POST /user
router.post('/user', resetPasswordLimiter, async (req, res) => {
  try {
    const { token, newPassword, email } = req.body;

    if (!token || !newPassword || !email) {
      return res.status(400).json({ error: 'Token, new password and email are required' });
    }

    // Hash the token to match DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const [rows] = await db.query(
      'SELECT id, reset_token_expiry FROM users WHERE reset_token = ? AND email = ?',
      [hashedToken, email]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    if (new Date() > new Date(user.reset_token_expiry)) {
      return res.status(400).json({ error: 'Token has expired' });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    return res.status(200).json({ message: 'Password has been reset successfully' });

  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
