const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authorizeAdmin = require('../middleware/authorizeAdmin')
const authenticateToken = require('../middleware/auth');

// ===== POST /bookings =====
// Make a booking for a car by a logged-in user
router.post('/', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  // 🔐 Allow only users to book
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Only users can make bookings' });
  }

  const { car_id, start_date, end_date } = req.body;

  if (!car_id || !start_date || !end_date) {
    return res.status(400).json({ message: 'car_id, start_date and end_date are required' });
  }

  try {
    // 1. Check if car exists
    const [carRows] = await db.query('SELECT * FROM cars WHERE id = ?', [car_id]);
    if (carRows.length === 0) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const car = carRows[0];

    // 2. Check for date overlap
    const [existingBookings] = await db.query(
      `SELECT * FROM bookings 
       WHERE car_id = ? AND (
         (start_date <= ? AND end_date >= ?) OR
         (start_date <= ? AND end_date >= ?) OR
         (start_date >= ? AND end_date <= ?)
       )`,
      [car_id, start_date, start_date, end_date, end_date, start_date, end_date]
    );

    if (existingBookings.length > 0) {
      return res.status(400).json({ message: 'Car already booked for the selected dates' });
    }

    // 3. Calculate total price
    const start = new Date(start_date);
    const end = new Date(end_date);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const totalPrice = car.price_per_day * days;

    // 4. Insert booking
    await db.query(
      'INSERT INTO bookings (user_id, car_id, start_date, end_date, total_price, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, car_id, start_date, end_date, totalPrice, 'pending']
    );


    res.status(201).json({ message: 'Booking created successfully', total_price: totalPrice });

  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== GET /bookings/user =====
// Get all bookings for the logged-in user with pagination
router.get('/user', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  // 🔐 Allow only users to access their bookings
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Only users can view their bookings' });
  }

  // ⏱️ Pagination setup
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;

  try {
    const [bookings] = await db.query(
      `SELECT b.*, b.status, c.name AS car_name, c.model, c.image_url
      FROM bookings b
      JOIN cars c ON b.car_id = c.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?`,
      [userId, pageSize, offset]
    );

    // 🔢 Get total count
    const [[{ count }]] = await db.query(
      `SELECT COUNT(*) AS count FROM bookings WHERE user_id = ?`,
      [userId]
    );

    res.json({
      bookings,
      pagination: {
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (err) {
    console.error('User bookings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ===== GET /bookings/company =====
// Get bookings for logged-in company with pagination
router.get('/company', authenticateToken, async (req, res) => {
  const companyId = req.user.id;

  // 🔐 Check if role is company
  if (req.user.role !== 'company') {
    return res.status(403).json({ message: 'Only companies can access this route' });
  }

  // ⏱️ Pagination setup
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;

  try {
    const [bookings] = await db.query(
      `SELECT b.*, b.status, u.name AS user_name, c.name AS car_name, c.model
       FROM bookings b
       JOIN cars c ON b.car_id = c.id
       JOIN users u ON b.user_id = u.id
       WHERE c.company_id = ?
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [companyId, pageSize, offset]
    );

    // 🔢 Get total bookings count for this company
    const [[{ count }]] = await db.query(
      `SELECT COUNT(*) AS count
       FROM bookings b
       JOIN cars c ON b.car_id = c.id
       WHERE c.company_id = ?`,
      [companyId]
    );

    res.json({
      bookings,
      pagination: {
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (err) {
    console.error('Company bookings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ===== GET /bookings/all =====
// Get all bookings with pagination
router.get('/all', authenticateToken, authorizeAdmin(['superadmin', 'moderator']), async (req, res) => {

  // ⏱️ Pagination setup
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;

  try {
    const [bookings] = await db.query(
      `SELECT b.*, b.status, u.name AS user_name, c.name AS car_name, c.model
       FROM bookings b
       JOIN cars c ON b.car_id = c.id
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );

    // 🔢 Get total bookings count
    const [[{ count }]] = await db.query(`SELECT COUNT(*) AS count FROM bookings b`);

    res.json({
      bookings,
      pagination: {
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
      },
    });
  } catch (err) {
    console.error('bookings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ===== DELETE /bookings/:id =====
// Cancel a booking (user or car owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
  const bookingId = req.params.id;
  const requesterId = req.user.id;
  const requesterRole = req.user.role;

  // 🔐 Optional role check (extra safety)
  if (!['user', 'company'].includes(requesterRole)) {
    return res.status(403).json({ message: 'Not authorized to delete bookings' });
  }

  try {
    const [rows] = await db.query(
      `SELECT b.*, c.company_id
       FROM bookings b
       JOIN cars c ON b.car_id = c.id
       WHERE b.id = ?`,
      [bookingId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = rows[0];

    if (booking.user_id !== requesterId && booking.company_id !== requesterId) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    await db.query('DELETE FROM bookings WHERE id = ?', [bookingId]);

    res.json({ message: 'Booking cancelled successfully' });

  } catch (err) {
    console.error('Delete booking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ===== PUT /bookings/:id =====
// Update booking dates (only by the booking user)
router.put('/:id', authenticateToken, async (req, res) => {
  const bookingId = req.params.id;
  const userId = req.user.id;

  // 🔐 Only users can edit their bookings
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Only users can edit bookings' });
  }

  const { start_date, end_date } = req.body;

  if (!start_date || !end_date) {
    return res.status(400).json({ message: 'start_date and end_date are required' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM bookings WHERE id = ?',
      [bookingId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = rows[0];

    if (booking.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to edit this booking' });
    }

    const [conflicts] = await db.query(
      `SELECT * FROM bookings
       WHERE car_id = ? AND id != ? AND (
         (start_date <= ? AND end_date >= ?) OR
         (start_date <= ? AND end_date >= ?) OR
         (start_date >= ? AND end_date <= ?)
       )`,
      [booking.car_id, bookingId, start_date, start_date, end_date, end_date, start_date, end_date]
    );

    if (conflicts.length > 0) {
      return res.status(400).json({ message: 'Car already booked for the new dates' });
    }

    const days = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)) + 1;
    const [carData] = await db.query('SELECT price_per_day FROM cars WHERE id = ?', [booking.car_id]);
    const total_price = carData[0].price_per_day * days;

    await db.query(
      'UPDATE bookings SET start_date = ?, end_date = ?, total_price = ? WHERE id = ?',
      [start_date, end_date, total_price, bookingId]
    );

    res.json({ message: 'Booking updated successfully', total_price });

  } catch (err) {
    console.error('Update booking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /bookings/:id/status
router.put('/:id/status', authenticateToken, async (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;
  const requester = req.user;

  // Only allow specific status values
  const validStatuses = ['confirmed', 'cancelled', 'rejected', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const [rows] = await db.query(
      `SELECT b.*, c.company_id 
       FROM bookings b 
       JOIN cars c ON b.car_id = c.id 
       WHERE b.id = ?`,
      [bookingId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = rows[0];

    // Authorization rules
    const isCompany = requester.role === 'company' && requester.id === booking.company_id;
    const isUser = requester.role === 'user' && requester.id === booking.user_id;

    if (status === 'confirmed' || status === 'rejected' || status === 'completed') {
      if (!isCompany) return res.status(403).json({ message: 'Only the company can update to this status' });
    }

    if (status === 'cancelled') {
      if (!isCompany && !isUser) return res.status(403).json({ message: 'Unauthorized to cancel this booking' });
    }

    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);

    res.json({ message: `Booking status updated to ${status}` });

  } catch (err) {
    console.error('Update booking status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
