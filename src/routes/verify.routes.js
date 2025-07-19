// src/routes/verify.routes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');
const authorizeAdmin = require('../middleware/authorizeAdmin')




/**
 * VERIFY USER  ─────────────────────────────────────────────
 * GET /verify/user?token=xxx
 */
router.get('/user', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check the code
    if (decoded.role !== 'user') {
      return res.status(400).json({ message: 'Invalid token role' });
    }

    // Update verification status
    await db.query(
      'UPDATE users SET is_verified = ?, verification_token = NULL WHERE id = ?',
      [true, decoded.id]
    );

    //
    res.json({ message: 'Email verified successfully. You can now log in.' });

  } catch (err) {
    console.error('Email verification error:', err);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

/**
 * VERIFY COMPANY  ─────────────────────────────────────────
 * GET /verify/company?token=xxx
 */
// router.get('/company', async (req, res) => {
//   const { token } = req.query;
//   if (!token) return res.status(400).json({ message: 'Token missing' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     if (decoded.role !== 'company') {
//       return res.status(400).json({ message: 'Invalid token role' });
//     }

//     await db.query(
//       'UPDATE companies SET is_verified = ?, verification_token = NULL WHERE id = ?',
//       [true, decoded.id]
//     );

//     res.json({ message: 'Company email verified successfully.' });

//   } catch (err) {
//     console.error('Email verification error:', err);
//     res.status(400).json({ message: 'Invalid or expired token' });
//   }
// });

router.put("/admin-verify", authenticateToken, authorizeAdmin(['superadmin', 'moderator']), async (req, res) => {
  const { email, role } = req.body;

  const roleToTable = {
    user: "users",
    company: "companies",
    worker: "workers"
  };

  const table = roleToTable[role];

  if (!table) return res.status(400).json({ message: "Invalid role" });

  console.log(table)

  try {
    const query = `SELECT * FROM ${table} WHERE email = ?`;
    const [rows] = await db.query(query, [email]);


    if (rows.length === 0) {
      return res.status(404).json({ message: `${role} Not found` });
    }

    const updateQuery = `UPDATE ${table} SET is_verified = ? where email = ?`;
    await db.query(updateQuery, [true, email])

    res.json({ message: `${role} is verified successfully` });
  } catch (err) {

    console.error(`verifying ${role} error:`, err);
    res.status(500).json({ message: 'Server error' });
  }

})

module.exports = router;
