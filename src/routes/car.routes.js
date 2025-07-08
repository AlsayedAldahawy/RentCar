const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');
const authorizeCompanyCarOwnership = require('../middleware/authorizeCarOwner');

// Add new car (only for authenticated companies)
router.post('/', authenticateToken, async (req, res) => {
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
    description
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
        description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        description
      ]
    );

    res.status(201).json({ message: 'Car added successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all cars
router.get('/', async (req, res) => {
  try {
    const [cars] = await db.query(
      `SELECT 
        cars.*, 
        companies.name AS company_name, 
        companies.phone AS company_phone 
       FROM cars 
       JOIN companies ON cars.company_id = companies.id
       ORDER BY created_at DESC`
    );

    res.status(200).json({ cars });

  } catch (err) {
    console.error(err);
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
    available
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
        available = ?
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

// ===== GET /cars/company =====
// Get all cars added by the logged-in company
router.get('/company', authenticateToken, async (req, res) => {
  const companyId = req.user.id;

  try {
    const [cars] = await db.query('SELECT * FROM cars WHERE company_id = ?', [companyId]);
    res.json({ cars });
  } catch (err) {
    console.error('Error fetching company cars:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
