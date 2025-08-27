const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');
const authenticateToken = require('../middleware/auth');
const authorizeAdmin = require('../middleware/authorizeAdmin')


// ===== POST /admin/login =====
// Login for admins (superadmin or moderator)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if admin exists
    const [adminResult] = await db.query('SELECT * FROM admins JOIN admin_role ON admins.role_id=admin_role.id WHERE email = ?', [email]);
    if (adminResult.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const admin = adminResult[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT with admin role
    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: admin.role, // 'superadmin' or 'moderator'
      type: 'admin'
    });

    // Return token and basic info
    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});

// POST /admins
// Create a new moderator (only by superadmin)
router.post('/', authenticateToken, authorizeAdmin(['superadmin']), async (req, res) => {
  const { name, email, password, role_id } = req.body;

  if (!name || !email || !password || !role_id) {
    return res.status(400).json({ message: 'Name, email, password, and role_id are required' });
  }

  try {
    // Check if role_id exists in admin_role table
    const [roleRows] = await db.query('SELECT id, role FROM admin_role WHERE id = ?', [role_id]);
    if (roleRows.length === 0) {
      return res.status(400).json({ message: 'Invalid role_id' });
    }

    const roleName = roleRows[0].role;

    // Check if email already exists
    const [existing] = await db.query('SELECT id FROM admins WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new admin
    await db.query(
      'INSERT INTO admins (name, email, password, role_id) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role_id]
    );

    res.status(201).json({ message: `Admin created successfully with role ${roleName}` });

  } catch (err) {
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});


// GET /admins
// Get all admins (superadmin only)
// GET /admins
// Get all admins (superadmin only) with optional filters by status and role
router.get('/', authenticateToken, authorizeAdmin(['superadmin']), async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const { status, role } = req.query; // Get optional filters

  try {
    // Build base query dynamically
    let baseQuery = `SELECT admins.id, admins.name, admins.email, admin_role.role AS role, admins.status, admins.created_at
                     FROM admins
                     JOIN admin_role ON admins.role_id = admin_role.id`;
    const queryParams = [];
    const filters = [];

    if (status) {
      filters.push('admins.status = ?');
      queryParams.push(status);
    }

    if (role) {
      filters.push('admins.role_id = ?');
      queryParams.push(role);
    }

    if (filters.length > 0) {
      baseQuery += ' WHERE ' + filters.join(' AND ');
    }

    baseQuery += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    const [admins] = await db.query(baseQuery, queryParams);

    // Total count with same filters
    let countQuery = 'SELECT COUNT(*) AS total FROM admins';
    if (filters.length > 0) {
      countQuery += ' WHERE ' + filters.join(' AND ');
    }
    const [[{ total }]] = await db.query(countQuery, filters.map(f => queryParams[filters.indexOf(f)])); 

    res.json({
      admins,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Get admins error:', err);
    res.status(500).json({ message: `Server error: ${err.message}` });
  }
});


// DELETE /admins/:id
// Delete an admin (superadmin only)
router.delete('/:id', authenticateToken, authorizeAdmin(['superadmin']), async (req, res) => {
  const adminId = req.params.id;

  try {
    const [admin] = await db.query('SELECT id FROM admins WHERE id = ?', [adminId]);
    if (admin.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    await db.query('DELETE FROM admins WHERE id = ?', [adminId]);
    res.json({ message: 'Admin deleted successfully' });

  } catch (err) {
    console.error('Delete admin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET /admins/profile
router.get('/profile', authenticateToken, authorizeAdmin(['superadmin', 'moderator']), async (req, res) => {
  const adminId = req.user.id;

  try {
    const [admins] = await db.query(
      'SELECT id, name, email, role FROM admins WHERE id = ?',
      [adminId]
    );

    if (admins.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ profile: admins[0] });

  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /admins/:id
router.put('/:id', authenticateToken, authorizeAdmin(['superadmin', 'moderator']), async (req, res) => {
  const targetAdminId = parseInt(req.params.id);
  const requesterId = req.user.id;
  const requesterRole = req.user.role;

  const { name, email, password, role } = req.body;

  // Only superadmin can update role or update others
  const isSelf = requesterId === targetAdminId;
  const isSuperAdmin = requesterRole === 'superadmin';

  if (!isSelf && !isSuperAdmin) {
    return res.status(403).json({ message: 'You are not allowed to edit other admins' });
  }

  if (role && !isSuperAdmin) {
    return res.status(403).json({ message: 'Only superadmin can change admin roles' });
  }

  try {
    const updates = [];
    const values = [];

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (role && isSuperAdmin) {
      updates.push('role = ?');
      values.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    const sql = `UPDATE admins SET ${updates.join(', ')} WHERE id = ?`;
    values.push(targetAdminId);

    await db.query(sql, values);

    res.json({ message: 'Admin updated successfully' });

  } catch (err) {
    console.error('Admin update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/role',authenticateToken, authorizeAdmin(['superadmin', 'moderator']), async (req, res)=>{
  try {
    const [roles] = await db.query(
      `SELECT id, role
       FROM admin_role`,
    );

     res.json({
      success: true,
      roles,
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
})
router.get('/:id', authenticateToken, authorizeAdmin(['superadmin']), async (req, res) => {
  const adminId = req.params.id;

  try {
    const [rows] = await db.query('SELECT id, name, email, role FROM admins WHERE id = ?', [adminId]);

    if (rows.length === 0) return res.status(404).json({ message: 'Admin not found' });

    res.json({ admin: rows[0] });
  } catch (err) {
    console.error('Get admin error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});




module.exports = router;
