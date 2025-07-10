const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');
const generateToken = require('../utils/generateToken');
const authenticateToken = require('../middleware/auth');

// ===== Register =====
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error(err);
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


// ===== Protected Route Example =====
router.get('/profile', authenticateToken, async (req, res) => {
  // Optional: check role
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Only users can access this profile' });
  }

  try {
    const [result] = await db.query('SELECT id, name, email FROM users WHERE id = ?', [req.user.id]);
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
router.get('/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const [rows] = await db.query('SELECT id, name, email FROM users WHERE id = ?', [userId]);

    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
