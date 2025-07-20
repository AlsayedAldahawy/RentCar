const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');
const generateToken = require('../utils/generateToken');
const authenticateToken = require('../middleware/auth');

const jwt = require('jsonwebtoken');
const sendAgreementFile = require('../utils/agreementFile');
const sendVerificationEmail = require('../utils/emailService')
const authorizeAdmin = require('../middleware/authorizeAdmin')

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

    // Insert company (unverified by default)
    const [result] = await db.query(
      'INSERT INTO companies (name, email, password, phone, is_verified) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, false]
    );

    const companyId = result.insertId;

    // Generate verification token
    const token = jwt.sign(
      { id: companyId, email, role: 'company' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send verification email
    await sendAgreementFile(email);

    res.status(201).json({ message: 'Company registered. Please check your email to verify your account.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ===== Login =====
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [companyResult] = await db.query('SELECT * FROM companies WHERE email = ?', [email]);
    if (companyResult.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const company = companyResult[0];


    if (!company.is_verified) {
      return res.status(401).json({ message: 'Please verify your account first' });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 🔐 Include role in token
    const token = generateToken({
      id: company.id,
      email: company.email,
      role: 'company' // 👈 very important!
    });

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
  // Optional: check if role is company
  if (req.user.role !== 'company') {
    return res.status(403).json({ message: 'Only companies can access this profile' });
  }

  try {
    const [result] = await db.query(
      'SELECT id, name, email, phone, status, profile_pic FROM companies WHERE id = ?',
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

// Get company by ID (profile public view)
router.get('/:id', async (req, res) => {
  const companyId = req.params.id;

  try {
    const [rows] = await db.query('SELECT id, name, email, phone, status, profile_pic FROM companies WHERE id = ?', [companyId]);

    if (rows.length === 0) return res.status(404).json({ message: 'Company not found' });

    res.json({ company: rows[0] });
  } catch (err) {
    console.error('Get company error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all companies with pagination
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const [rows] = await db.query(
      `SELECT id, name, email, phone, status, profile_pic FROM companies
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [[{ total }]] = await db.query('SELECT COUNT(*) AS total FROM companies');

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No companies found' });
    }

    res.json({
      companies: rows,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Get companies error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /companies/:id
// Only superadmin can delete companies
router.delete('/:id', authenticateToken, authorizeAdmin(['superadmin']), async (req, res) => {
  const companyId = req.params.id;

  try {
    const [result] = await db.query('DELETE FROM companies WHERE id = ?', [companyId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ message: 'Company deleted successfully' });
  } catch (err) {
    console.error('Delete company error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /companies/:id (admin only)
router.put('/:id', authenticateToken, authorizeAdmin(['superadmin', 'moderator']), async (req, res) => {
  const companyId = parseInt(req.params.id);
  const { name, email, phone, password, status } = req.body;

  const updates = [];
  const values = [];

  try {
    if (name) {
      updates.push('name = ?');
      values.push(name);
    }

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }

    if (phone) {
      updates.push('phone = ?');
      values.push(phone);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (status) {
      const allowedStatus = ['active', 'inactive', 'pending', 'suspended', 'deleted', 'rejected'];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const sql = `UPDATE companies SET ${updates.join(', ')} WHERE id = ?`;
    values.push(companyId);

    await db.query(sql, values);
    res.json({ message: 'Company updated successfully' });

  } catch (err) {
    console.error('Admin update company error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /companies/self
router.put('/self', authenticateToken, async (req, res) => {
  if (req.user.role !== 'company') {
    return res.status(403).json({ message: 'Only companies can access this route' });
  }

  const companyId = req.user.id;
  const { name, email, phone, password } = req.body;

  const updates = [];
  const values = [];

  try {
    if (name) {
      updates.push('name = ?');
      values.push(name);
    }

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }

    if (phone) {
      updates.push('phone = ?');
      values.push(phone);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const sql = `UPDATE companies SET ${updates.join(', ')} WHERE id = ?`;
    values.push(companyId);

    await db.query(sql, values);
    res.json({ message: 'Company profile updated successfully' });

  } catch (err) {
    console.error('Company self update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ====== Resend Verification =========
// router.post('/resend-verification', async (req, res) => {
//   const { email } = req.body;

//   try {
//     const [companies] = await db.query('SELECT * FROM companies WHERE email = ?', [email]);

//     if (companies.length === 0) {
//       return res.status(404).json({ message: 'Company not found' });
//     }

//     const company = companies[0];

//     if (company.is_verified) {
//       return res.status(400).json({ message: 'Company is already verified' });
//     }

//     const token = jwt.sign(
//       { id: company.id, email: company.email, role: 'company' },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     await sendVerificationEmail(company.email, token, 'company');

//     res.json({ message: 'Verification email resent. Please check your inbox.' });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

module.exports = router;
