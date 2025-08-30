const db = require('../config/db.js');

// Get all companies with pagination + filters
exports.getCompanies = async (filters, pagination, userType) => {
  const { cityId, regionId, status, name } = filters;
  const { limit, offset } = pagination;

  // Build base query dynamically
  let whereClause = 'WHERE 1=1';
  const values = [];

  if (cityId) {
    whereClause += ' AND cm.city_id = ?';
    values.push(cityId);
  }

  if (regionId) {
    whereClause += ' AND ct.region_id = ?';
    values.push(regionId);
  }

  if (status) {
    whereClause += ' AND cm.status = ?';
    values.push(status);
  }

  if (name) {
    whereClause += ' AND cm.name LIKE ?';
    values.push(`%${name}%`);
  }

  let q = '';
  if (userType === 'admin') {
    q = `
      SELECT 
        cm.id, cm.name, email, phone, profile_pic AS profilePic, address, ct.name AS city, rg.name AS region, created_at AS createdAs, is_verified AS isVerified, status
      FROM companies AS cm JOIN cities AS ct ON cm.city_id = ct.id
      JOIN regions AS rg ON ct.region_id = rg.id
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;
  } else {
    q = `
      SELECT 
        cm.id, cm.name, cm.email, cm.phone, cm.profile_pic AS profilePic
      FROM companies AS cm
      ${whereClause}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;
  }

  // Get paginated results
  const [rows] = await db.query(q, [...values, limit, offset]);

  // Get total count with same filters
  const [[{ total }]] = await db.query(
    `SELECT COUNT(*) AS total FROM companies AS cm JOIN cities AS ct ON cm.city_id = ct.Id ${whereClause}`,
    values
  );

  return { rows, total };
};
