const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');
const authorizeCompanyCarOwnership = require('../middleware/authorizeCarOwner');

// ===== POST /cars =====
// Add new car (only for authenticated companies)
router.post('/', authenticateToken, async (req, res) => {
  // 🔐 Ensure role is company
  if (req.user.role !== 'company') {
    return res.status(403).json({ message: 'Only companies can add cars' });
  }

  const {
    name,
    model,
    capacity,
    price_per_day,
    transmission,
    fuel_type,
    mileage,
    color,
    license_plate,
    insurance_expiry,
    image_url,
    description,
    city
  } = req.body;

  const companyId = req.user.id; // From Token

  try {
    await db.query(
      `INSERT INTO cars (
        company_id,
        name,
        model,
        capacity,
        price_per_day,
        transmission,
        fuel_type,
        mileage,
        color,
        license_plate,
        insurance_expiry,
        image_url,
        description,
        city
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        companyId,
        name,
        model,
        capacity,
        price_per_day,
        transmission,
        fuel_type,
        mileage,
        color,
        license_plate,
        insurance_expiry,
        image_url,
        description,
        city
      ]
    );

    res.status(201).json({ message: 'Car added successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== GET /cars =====
// Get all cars with pagination + filters
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;

  // Extract filters from query
  const {
    transmission,
    fuel_type,
    capacity,
    available,
    city,
    min_price,
    max_price,
    name,
    model,
  } = req.query;

  // Build WHERE clause dynamically
  let whereClause = `WHERE 1=1`;
  const values = [];

  if (transmission) {
    whereClause += ` AND cars.transmission = ?`;
    values.push(transmission);
  }

  if (fuel_type) {
    whereClause += ` AND cars.fuel_type = ?`;
    values.push(fuel_type);
  }

  if (capacity) {
    whereClause += ` AND cars.capacity >= ?`;
    values.push(capacity);
  }

  if (available !== undefined) {
    whereClause += ` AND cars.available = ?`;
    values.push(available);
  }

  if (city) {
    whereClause += ` AND cars.city = ?`;
    values.push(city);
  }

  if (min_price) {
    whereClause += ` AND cars.price_per_day >= ?`;
    values.push(min_price);
  }

  if (max_price) {
    whereClause += ` AND cars.price_per_day <= ?`;
    values.push(max_price);
  }

  if (name) {
    whereClause += ` AND cars.name LIKE ?`;
    values.push(`%${name}%`);
  }

  if (model) {
    whereClause += ` AND cars.model LIKE ?`;
    values.push(`%${model}%`);
  }

  try {
    // Fetch filtered cars
    const [cars] = await db.query(
      `SELECT 
        cars.*, 
        companies.name AS company_name, 
        companies.phone AS company_phone 
       FROM cars 
       JOIN companies ON cars.company_id = companies.id
       ${whereClause}
       ORDER BY cars.created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, pageSize, offset]
    );

    // Get total count for pagination
    const [[{ count }]] = await db.query(
      `SELECT COUNT(*) AS count 
       FROM cars 
       JOIN companies ON cars.company_id = companies.id
       ${whereClause}`,
      values
    );

    res.status(200).json({
      cars,
      pagination: {
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (err) {
    console.error('Error fetching cars:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ===== GET /cars/company/:companyId =====
// Public: Get all cars of a specific company with filters
router.get('/company/:companyId', async (req, res) => {
  const companyId = req.params.companyId;
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;

  const {
    transmission,
    fuel_type,
    capacity,
    available,
    city,
    min_price,
    max_price,
    name,
    model,
  } = req.query;

  let whereClause = `WHERE company_id = ?`;
  const values = [companyId];

  if (transmission) {
    whereClause += ` AND transmission = ?`;
    values.push(transmission);
  }

  if (fuel_type) {
    whereClause += ` AND fuel_type = ?`;
    values.push(fuel_type);
  }

  if (capacity) {
    whereClause += ` AND capacity >= ?`;
    values.push(capacity);
  }

  if (available !== undefined) {
    whereClause += ` AND available = ?`;
    values.push(available);
  }

  if (city) {
    whereClause += ` AND city = ?`;
    values.push(city);
  }

  if (min_price) {
    whereClause += ` AND price_per_day >= ?`;
    values.push(min_price);
  }

  if (max_price) {
    whereClause += ` AND price_per_day <= ?`;
    values.push(max_price);
  }

  if (name) {
    whereClause += ` AND name LIKE ?`;
    values.push(`%${name}%`);
  }

  if (model) {
    whereClause += ` AND model LIKE ?`;
    values.push(`%${model}%`);
  }

  try {
    const [cars] = await db.query(
      `SELECT * FROM cars
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...values, pageSize, offset]
    );

    const [[{ count }]] = await db.query(
      `SELECT COUNT(*) AS count FROM cars ${whereClause}`,
      values
    );

    res.json({
      cars,
      pagination: {
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (err) {
    console.error('Error fetching company cars:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ===== PUT /cars/:id =====
// Update a car (only if it belongs to the logged-in company)
router.put('/:id', authenticateToken, authorizeCompanyCarOwnership, async (req, res) => {
  const carId = req.params.id;

  const {
    name,
    model,
    capacity,
    price_per_day,
    transmission,
    fuel_type,
    mileage,
    color,
    license_plate,
    insurance_expiry,
    image_url,
    description,
    available,
    city
  } = req.body;

  try {
    await db.query(
      `UPDATE cars SET 
        name = ?, 
        model = ?, 
        capacity = ?, 
        price_per_day = ?, 
        transmission = ?, 
        fuel_type = ?, 
        mileage = ?, 
        color = ?, 
        license_plate = ?, 
        insurance_expiry = ?, 
        image_url = ?, 
        description = ?, 
        available = ?,
        city = ?
      WHERE id = ?`,
      [
        name,
        model,
        capacity,
        price_per_day,
        transmission,
        fuel_type,
        mileage,
        color,
        license_plate,
        insurance_expiry,
        image_url,
        description,
        available,
        city,
        carId
      ]
    );

    res.json({ message: 'Car updated successfully' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== DELETE /cars/:id =====
// Delete a car (only if it belongs to the logged-in company)
router.delete('/:id', authenticateToken, authorizeCompanyCarOwnership, async (req, res) => {
  const carId = req.params.id;

  try {
    await db.query('DELETE FROM cars WHERE id = ?', [carId]);
    res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// // ===== GET /cars/company =====
// // Get all cars added by the logged-in company
// router.get('/company', authenticateToken, async (req, res) => {
//   // 🔐 Ensure only companies can access their own cars
//   if (req.user.role !== 'company') {
//     return res.status(403).json({ message: 'Only companies can access this route' });
//   }

//   const companyId = req.user.id;

//   try {
//     const [cars] = await db.query('SELECT * FROM cars WHERE company_id = ?', [companyId]);
//     res.json({ cars });
//   } catch (err) {
//     console.error('Error fetching company cars:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// Get car by ID
router.get('/:id', async (req, res) => {
  const carId = req.params.id;

  try {
    const [rows] = await db.query(
      `SELECT cars.*, companies.name AS company_name 
       FROM cars 
       JOIN companies ON cars.company_id = companies.id 
       WHERE cars.id = ?`,
      [carId]
    );

    if (rows.length === 0) return res.status(404).json({ message: 'Car not found' });

    res.json({ car: rows[0] });
  } catch (err) {
    console.error('Get car error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
