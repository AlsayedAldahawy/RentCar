const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    const { regionId } = req.query;

    if (!regionId) {
        try {
            const [cities] = await db.query(
                `SELECT c.id, c.name AS name, r.name as region 
                 FROM cities AS c 
                 JOIN regions AS r ON c.region_id = r.id 
                 ORDER BY c.id`
            );

            return res.json({
                success: true,
                cities,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }

    try {
        // ✅ Check if region exists
        const [regionRows] = await db.query(
            "SELECT id FROM regions WHERE id = ?",
            [regionId]
        );

        if (regionRows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Region not found",
            });
        }

        // ✅ Fetch cities if region exists
        const [cities] = await db.query(
            `SELECT c.id, c.name AS name, r.name as region 
             FROM cities AS c 
             JOIN regions AS r ON c.region_id = r.id 
             WHERE region_id = ? 
             ORDER BY c.id`,
            [regionId]
        );

        return res.json({
            success: true,
            cities,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;
