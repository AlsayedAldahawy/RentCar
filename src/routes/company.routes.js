const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');
const generateToken = require('../utils/generateToken');
const authenticateToken = require('../middleware/auth');

const jwt = require('jsonwebtoken');
const sendAgreementFile = require('../utils/agreementFile');
const authorizeAdmin = require('../middleware/authorizeAdmin')
const crypto = require('crypto')
const { resetPasswordLimiter } = require('../middleware/rateLimiters')
const { sendVerificationEmail, resetPasswordEmail } = require('../utils/emailService');




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
        pfp: company.profile_pic
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err });
  }
});

// ===== Protected Profile Route =====
router.get('/profile', authenticateToken, async (req, res) => {
  if (req.user.role !== 'company') {
    return res.status(403).json({ message: 'Only companies can access this profile' });
  }

  try {
    const [result] = await db.query(
      `SELECT 
        id,
        name,
        email,
        phone,
        status,
        profile_pic,
        address,
        city,
        region
       FROM companies 
       WHERE id = ?`,
      [req.user.id]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({
      success: true,
      profile: result[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// Get company by ID (profile public view)
router.get('/:id', async (req, res) => {
  const companyId = req.params.id;

  try {
    const [rows] = await db.query('SELECT name, email, phone, status, profile_pic, address, city, region FROM companies WHERE id = ?', [companyId]);

    if (rows.length === 0) return res.status(404).json({ message: 'Company not found' });

    res.json({ company: rows[0] });
  } catch (err) {
    console.error('Get company error:', err);
    res.status(500).json({ message: err.message });
  }
});


// Get company by ID (For Admins only)
router.get('/admin/:id', authenticateToken, authorizeAdmin(['superadmin', 'moderator']), async (req, res) => {
  const companyId = req.params.id;

  try {
    const [rows] = await db.query('SELECT id, name, email, phone, profile_pic, address, city, region, created_at, is_verified, status FROM companies WHERE id = ?', [companyId]);

    if (rows.length === 0) return res.status(404).json({ message: 'Company not found' });

    res.json({ company: rows[0] });
  } catch (err) {
    console.error('Get company error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all companies with pagination
router.get('/', authenticateToken, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  let q = '';
  if (req.user.type === 'admin') {
    q = `SELECT id, name, email, phone, profile_pic, address, city, region, created_at, is_verified, status FROM companies
       ORDER BY id DESC
       LIMIT ? OFFSET ?`
  } else {
    q = `SELECT name, email, phone, profile_pic FROM companies
       ORDER BY id DESC
       LIMIT ? OFFSET ?`
  }

  try {
    const [rows] = await db.query(q, [limit, offset]
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
    res.status(500).json({ message: err.message });
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

// PUT /companies/profile
router.put('/profile', authenticateToken, async (req, res) => {
  if (req.user.role !== 'company') {
    return res.status(403).json({ message: 'Only company can update their profile' });
  }

  const companyId = req.user.id;
  const { name, phone, profile_pic, email, address, city, region } = req.body;

  try {
    const updates = [];
    const values = [];

    // name
    if (name) {
      if (name.length > 100) {
        throw new Error("Company name cannot exceed 100 characters");
      }
      updates.push('name = ?');
      values.push(name);
    }

    // phone
    if (phone) {
      if (phone.length > 20) {
        throw new Error("Phone number cannot exceed 20 characters");
      }
      updates.push('phone = ?');
      values.push(phone);
    }

    // email
    if (email) {
      if (email.length > 100) {
        throw new Error("Email cannot exceed 100 characters");
      }

      // check if email already exists in another record
      const [existing] = await db.query(
        'SELECT id FROM companies WHERE email = ? AND id <> ?',
        [email, companyId]
      );

      if (existing.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      updates.push('email = ?');
      values.push(email);
    }

    // address
    if (address) {
      if (address.length > 150) {
        throw new Error("Address cannot exceed 150 characters");
      }
      updates.push('address = ?');
      values.push(address);
    }

    // city
    if (city) {
      if (city.length > 100) {
        throw new Error("City cannot exceed 100 characters");
      }
      updates.push('city = ?');
      values.push(city);
    }

    // region 
    if (region) {
      if (region.length > 100) {
        throw new Error("Region cannot exceed 100 characters");
      }
      updates.push('region = ?');
      values.push(region);
    }

    // profile_pic
    if (profile_pic) {
      if (profile_pic.length > 255) {
        throw new Error("Profile picture path cannot exceed 255 characters");
      }
      updates.push('profile_pic = ?');
      values.push(profile_pic);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const sql = `UPDATE companies SET ${updates.join(', ')} WHERE id = ?`;
    values.push(companyId);

    await db.query(sql, values);

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});



router.post('/reset-password', async (req, res) => {

  const { email } = req.body;

  try {
    const [companies] = await db.query('SELECT * FROM companies WHERE email = ?', [email]);

    if (companies.length === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const company = companies[0];

    let token, hashedToken, existing;

    do {
      token = crypto.randomBytes(32).toString('hex');
      hashedToken = crypto.createHash("sha256").update(token).digest("hex");
      [existing] = await db.query('SELECT id FROM companies WHERE reset_token = ?', [hashedToken]);
    } while (existing.length > 0);

    const expiry = new Date(Date.now() + 3600000);

    await db.query('UPDATE companies SET reset_token = ?, reset_token_expiry = ? WHERE id = ? and email = ?', [
      hashedToken,
      expiry,
      company.id,
      email,
    ]);

    await resetPasswordEmail(email, token, 'company');

    res.json({ message: 'Password reset link sent to email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== Change company password (self) =====
router.post('/update-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const companyId = req.user.id;

  if (!companyId || !oldPassword || !newPassword) {
    return res.status(400).json({ message: 'old password and new password are required' });
  }

  try {
    const [companies] = await db.query('SELECT * FROM companies WHERE id = ?', [companyId]);
    if (companies.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const company = companies[0];

    const isMatch = await bcrypt.compare(oldPassword, company.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Old password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query('UPDATE companies SET password = ? WHERE id = ?', [hashedPassword, companyId]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
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

// PUT /companies/status/:id (admin only)
router.put('/status/:id', authenticateToken, authorizeAdmin(['superadmin', 'moderator']), async (req, res) => {
  const companyId = parseInt(req.params.id, 10);
  const { status } = req.body;

   
  try {
    if (isNaN(companyId)) {
      throw new Error("Company's id is a must")
    }

    const rows = await db.query(`SELECT name FROM companies where id=${companyId}`)
    if (rows[0].length < 1) {
      throw new Error("Invalid id")
    }

    const allowedStatus = ['active', 'inactive', 'pending', 'suspended', 'deleted', 'rejected'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const sql = `UPDATE companies SET status= ? WHERE id = ?`;
    await db.query(sql, [status, companyId]);
    res.json({ message: "Company's status updated successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// PUT /companies/verify/:id (admin only)
router.put('/verify/:id', authenticateToken, authorizeAdmin(['superadmin', 'moderator']), async (req, res) => {
  const companyId = parseInt(req.params.id);
  const { verify } = req.body;

  try {
    const allowedValues = [true, false];
    if (!allowedValues.includes(verify)) {
      return res.status(400).json({ message: 'Invalid value' });
    }

    if (isNaN(companyId)) {
      throw new Error("Company's id is a must")
    }

    const rows = await db.query(`SELECT name FROM companies where id=${companyId}`)

    if (rows[0].length < 1) {
      throw new Error("Invalid id")
    }

    const sql = `UPDATE companies SET is_verified= ? WHERE id = ?`;
    await db.query(sql, [verify, companyId]);
    res.json({ message: "Company's status updated successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
