const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');
const generateToken = require('../utils/generateToken');
const authenticateToken = require('../middleware/auth');

// ===== Register =====
router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    // Check if company already exists
    const [existingCompany] = await db.query('SELECT * FROM companies WHERE email = ?', [email]);
    if (existingCompany.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert company
    await db.query(
      'INSERT INTO companies (name, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, phone]
    );

    res.status(201).json({ message: 'Company registered successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ===== Login =====
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if company exists
    const [companyResult] = await db.query('SELECT * FROM companies WHERE email = ?', [email]);
    if (companyResult.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const company = companyResult[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = generateToken({ id: company.id, email: company.email });

    res.status(200).json({
      message: 'Login successful',
      token,
      company: {
        id: company.id,
        name: company.name,
        email: company.email,
        phone: company.phone
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Protected Profile Route =====
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [result] = await db.query(
      'SELECT id, name, email, phone FROM companies WHERE id = ?',
      [req.user.id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ profile: result[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
