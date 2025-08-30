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
const { sendCompRegistEmail, generateRandomPassword } = require('../utils/randomPassword');
const fieldCheck = require('../utils/checkConstrains')
const { getCompaniesController } = require('../controllers/companyController.js');



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

    // Send verification email
    await sendAgreementFile(email);

    res.status(201).json({ message: 'Company registered. Please check your email to verify your account.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Server error:${err.message}` });
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

    // Include role in token
    const token = generateToken({
      id: company.id,
      email: company.email,
      role: 'company' // very important!
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
    res.status(500).json({ message: `Server error:${err.message}` });
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
        cm.id,
        cm.name,
        cm.email,
        cm.phone,
        cm.status,
        cm.profile_pic AS profilePic,
        cm.address,
        ct.name AS city,
        rg.name AS region
       FROM companies AS cm JOIN cities as ct ON cm.city_id = ct.id
       JOIN regions as rg ON ct.region_id = rg.id
       WHERE cm.id = ?`,
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
    res.status(500).json({ success: false, message: `Server error:${err.message}` });
  }
});


// Get company by ID (profile public view)
router.get('/:id', async (req, res) => {
  const companyId = req.params.id;

  try {
    const [rows] = await db.query(`SELECT cm.name, email, phone, status, profile_pic as profilePic,
                      address, ct.name AS city, rg.name AS region
                      FROM companies AS cm JOIN cities AS ct
                      ON cm.city_id = ct.id Join regions AS rg
                      ON ct.region_id = rg.id
                      WHERE cm.id = ?`, [companyId]);

    if (rows.length === 0) return res.status(404).json({ message: 'Company not found' });

    res.json({ company: rows[0] });
  } catch (err) {
    res.status(500).json({ message: `Server error:${err.message}` });
  }
});


// Get company by ID (For Admins only)
router.get('/admin/:id', authenticateToken, authorizeAdmin(['superadmin', 'moderator']), async (req, res) => {
  const companyId = req.params.id;

  try {
    const [rows] = await db.query(`SELECT cm.id, cm.name, email, phone, cm.profile_pic AS profilePic, address, ct.name as city, rg.name as region, created_at AS createdAs,
      is_verified AS isVerified, status FROM companies as cm JOIN cities AS ct ON cm.city_id = ct.id
      JOIN regions AS rg ON ct.region_id = rg.id WHERE cm.id = ?`, [companyId]);

    if (rows.length === 0) return res.status(404).json({ message: 'Company not found' });

    res.json({ company: rows[0] });
  } catch (err) {
    res.status(500).json({ message: `Server error:${err.message}` });
  }
});

// Get all companies with pagination and filters
router.get('/', authenticateToken, getCompaniesController);


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
    res.status(500).json({ message: `Server error:${err.message}` });
  }
});

// PUT /companies/profile
router.put('/profile', authenticateToken, async (req, res) => {
  if (req.user.role !== 'company') {
    return res.status(403).json({ message: 'Only company can update their profile' });
  }

  const companyId = req.user.id;
  try {
    const { name, phone, profilePic, email, address, cityId } = req.body;

    // Validation check
    fieldCheck([
      { name: 'name', value: name, type: 'string', len: 100 },
      { name: 'email', value: email, type: 'string', len: 100 },
      { name: 'phone', value: phone, type: 'string', len: 20 },
      { name: 'profilePic', value: profilePic, type: 'string', len: 255 },
      { name: 'address', value: address, type: 'string', len: 150 },
      { name: 'cityId', value: cityId, type: 'number' },
    ]);


    // Check if companyId exists in the companies table (for updates)
    const [companyRows] = await db.query("SELECT id FROM companies WHERE id = ?", [companyId]);
    if (companyRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Company not found",
      });
    }

    const updates = [];
    const values = [];

    // Check if cityId exists in the cities table
    if (cityId) {
      const [cityRows] = await db.query("SELECT id FROM cities WHERE id = ?", [cityId]);
      if (cityRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "City ID not found in the cities table",
        });
      }

      updates.push('city_id = ?');
      values.push(cityId);
    }

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
      updates.push('phone = ?');
      values.push(phone);
    }

    // email
    if (email) {
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
      updates.push('address = ?');
      values.push(address);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const sql = `UPDATE companies SET ${updates.join(', ')} WHERE id = ?`;
    values.push(companyId);

    await db.query(sql, values);

    res.json({
      success: true,
      message: 'Your profile updated successfully',
      companyId,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
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
    res.status(500).json({ message: `Server error:${err.message}`});
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
  const { name, phone, profilePic, email, address, cityId } = req.body;

   try {
    const { name, phone, profilePic, email, address, cityId } = req.body;

    // Validation check
    fieldCheck([
      { name: 'name', value: name, type: 'string', len: 100 },
      { name: 'email', value: email, type: 'string', len: 100 },
      { name: 'phone', value: phone, type: 'string', len: 20 },
      { name: 'profilePic', value: profilePic, type: 'string', len: 255 },
      { name: 'address', value: address, type: 'string', len: 150 },
      { name: 'cityId', value: cityId, type: 'number' },
    ]);


    // Check if companyId exists in the companies table (for updates)
    const [companyRows] = await db.query("SELECT id FROM companies WHERE id = ?", [companyId]);
    if (companyRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Company not found",
      });
    }

    const updates = [];
    const values = [];

    // Check if cityId exists in the cities table
    if (cityId) {
      const [cityRows] = await db.query("SELECT id FROM cities WHERE id = ?", [cityId]);
      if (cityRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "City ID not found in the cities table",
        });
      }

      updates.push('city_id = ?');
      values.push(cityId);
    }

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
      updates.push('phone = ?');
      values.push(phone);
    }

    // email
    if (email) {
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
      updates.push('address = ?');
      values.push(address);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const sql = `UPDATE companies SET ${updates.join(', ')} WHERE id = ?`;
    values.push(companyId);

    await db.query(sql, values);

    res.json({
      success: true,
      message: 'Company updated successfully',
      companyId,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
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
    res.json({ message: "Company is verified successfully successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Admin Adding Company
router.post('/add-company', authenticateToken, authorizeAdmin(['superadmin', 'moderator']), async (req, res) => {
  const { name, email, phone, status, address, city, region } = req.body;

  try {
    // Check if company already exists
    const [existingCompany] = await db.query('SELECT * FROM companies WHERE email = ?', [email]);
    if (existingCompany.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    fieldCheck([
      { name: 'name', value: name, type: 'string', len: 100 },
      { name: 'email', value: email, type: 'string', len: 100 },
      { name: 'phone', value: phone, type: 'string', len: 20 },
      { name: 'status', value: status, type: 'string', valuesList: ['active', 'inactive', 'pending', 'suspended', 'deleted', 'rejected'] },
      { name: 'address', value: address, type: 'string', len: 150 },
      { name: 'city', value: city, type: 'string', len: 100 },
      { name: 'region', value: region, type: 'string', len: 100 }
    ]);

    const password = generateRandomPassword(10);


    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert company (unverified by default)
    const [result] = await db.query(
      'INSERT INTO companies (name, email, password, phone, status, address, city, region) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, status, address, city, region]
    );

    // Send verification email
    await sendCompRegistEmail(email, password);

    res.status(201).json({ message: 'Company registered successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

module.exports = router;
