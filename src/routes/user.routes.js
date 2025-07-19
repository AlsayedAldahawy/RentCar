const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');
const generateToken = require('../utils/generateToken');
const authenticateToken = require('../middleware/auth');

// ===== Register =====
// routes/user.routes.js
const sendVerificationEmail = require('../utils/emailService');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password, phone, is_verified) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, false]
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
        email: user.email
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
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Only users can access this profile' });
  }

  try {
    const [result] = await db.query('SELECT id, name, email, phone, is_verified FROM users WHERE id = ?', [req.user.id]);
    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ profile: result[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  const userId = req.params.id;

  try {
    const [rows] = await db.query('SELECT id, name, email, phone, is_verified FROM users WHERE id = ?', [userId]);

    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /users?page=1&limit=10
router.get('/', authenticateToken, authorizeAdmin(['superadmin', 'moderator'], async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, is_verified FROM users LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [countResult] = await db.query('SELECT COUNT(*) AS total FROM users');
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.json({
      users: rows,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}));



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

module.exports = router;
