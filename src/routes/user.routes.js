const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');
const generateToken = require('../utils/generateToken');
const authenticateToken = require('../middleware/auth');
const authorizeAdmin = require('../middleware/authorizeAdmin')
const crypto = require('crypto');
const { resetPasswordLimiter } = require('../middleware/rateLimiters')


// ===== Register =====
// routes/user.routes.js
const { sendVerificationEmail, resetPasswordEmail } = require('../utils/emailService');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const { name, email, password, phone, profilePic } = req.body;

  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, phone, profile_pic, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, profilePic ?? null, false]
    );

    const userId = result.insertId;

    // Generate verification token (expires in 1 hour)
    const token = jwt.sign({ id: userId, email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send email
    await sendVerificationEmail(email, token, 'user');

    res.status(201).json({ message: 'Registration successful. Please verify your email.' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Login =====
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [userResult] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (userResult.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = userResult[0];

    if (!user.is_verified) {
      return res.status(401).json({ message: 'Please verify your email first' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 🔐 Include role in the token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: 'user'
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        pfp: user.profile_pic,
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Protected Route =====
router.get('/profile', authenticateToken, async (req, res) => {
  // Optional: check role
  if (req.user.role !== 'user' || req.user.role !== 'company') {
    return res.status(403).json({ message: 'Only users can access this profile' });
  }

  try {
    const [result] = await db.query('SELECT id, name, email, phone, created_at, profile_pic, is_verified FROM users WHERE id = ?', [req.user.id]);
    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ profile: result[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID (Admins only)
router.get('/:id', authenticateToken, authorizeAdmin(['superadmin', 'moderator']), async (req, res) => {
  const userId = req.params.id;

  try {
    const [rows] = await db.query('SELECT id, name, email, phone, created_at, profile_pic, status, is_verified FROM users WHERE id = ?', [userId]);

    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /users?page=1&limit=10&name=ali&status=active&is_verified=1
router.get('/', authenticateToken, authorizeAdmin(['superadmin', 'moderator']), async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const {
    name,
    email,
    phone,
    status,
    is_verified
  } = req.query;

  let whereClause = 'WHERE 1';
  const values = [];

  if (name) {
    whereClause += ' AND name LIKE ?';
    values.push(`%${name}%`);
  }

  if (email) {
    whereClause += ' AND email LIKE ?';
    values.push(`%${email}%`);
  }

  if (phone) {
    whereClause += ' AND phone LIKE ?';
    values.push(`%${phone}%`);
  }

  if (status) {
    whereClause += ' AND status = ?';
    values.push(status);
  }

  if (is_verified !== undefined) {
    whereClause += ' AND is_verified = ?';
    values.push(is_verified);
  }

  try {
    const [rows] = await db.query(
      `SELECT id, name, email, phone, created_at, profile_pic, status, is_verified
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM users ${whereClause}`,
      values
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.json({
      users: rows,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Update user profile (self) =====
router.put('/profile', authenticateToken, async (req, res) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Only users can update their profile' });
  }

  const userId = req.user.id;
  const { name, phone, profile_pic, email } = req.body;

  try {
    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }

    if (phone) {
      updates.push('phone = ?');
      values.push(phone);
    }

    if (email) {
      // check if email already exists in another record
      const [existing] = await db.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      updates.push('email = ?');
      values.push(email);
    }


    if (profile_pic) {
      updates.push('profile_pic = ?');
      values.push(profile_pic);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    values.push(userId);

    await db.query(sql, values);

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ message: `${err}` });

  }
});

// ====== Resend Verification =========
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    if (user.is_verified) {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await sendVerificationEmail(user.email, token, 'user');

    res.json({ message: 'Verification email resent. Please check your inbox.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reset-password', async (req, res) => {

  const { email } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const user = users[0];

    let token, hashedToken, existing;

    /**
       * Generate a unique and secure reset token.
       * 
       * Even though crypto.randomBytes(32) is already secure and extremely unlikely to produce duplicates,
       * ÷ use a while loop to check against existing tokens in the database — just in case.
       * 
       * For security reasons, ÷ store only the SHA-256 hash of the token in the database.
       * This way, even if the database is compromised, an attacker cannot use the token to reset the password.
       * 
       * The original token (in plain text) will be sent to the user via email and used for verification later.
    */

    do {
      token = crypto.randomBytes(32).toString('hex');
      hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      [existing] = await db.query('SELECT id FROM users WHERE reset_token = ?', [hashedToken]);
    } while (existing.length > 0);

    const expiry = new Date(Date.now() + 3600000);

    await db.query('UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ? and email = ?', [
      hashedToken,
      expiry,
      user.id,
      email,
    ]);

    await resetPasswordEmail(email, token, 'user');

    res.json({ message: 'Password reset link sent to email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Change user password (self) =====
router.post('/update-password',authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ message: 'old password, and new password are required' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Admin update user =====
router.put('/:id', authenticateToken, authorizeAdmin(['superadmin', 'moderator']), async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, phone, profile_pic, password, status, is_verified } = req.body;

  try {
    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }

    if (phone) {
      updates.push('phone = ?');
      values.push(phone);
    }

    if (profile_pic) {
      updates.push('profile_pic = ?');
      values.push(profile_pic);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (status) {
      updates.push('status = ?');
      values.push(status);
    }

    if (is_verified !== undefined) {
      updates.push('is_verified = ?');
      values.push(is_verified);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    values.push(userId);

    await db.query(sql, values);

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Admin update user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
