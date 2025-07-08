const db = require('../config/db');

const authorizeCompanyCarOwnership = async (req, res, next) => {
  const carId = req.params.id;
  const companyId = req.user.id;

  try {
    const [rows] = await db.query(
      'SELECT * FROM cars WHERE id = ? AND company_id = ?',
      [carId, companyId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: 'You do not own this car' });
    }

    // 
    next();
  } catch (err) {
    console.error('Authorization error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = authorizeCompanyCarOwnership;
