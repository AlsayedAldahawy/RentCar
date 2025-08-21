const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async(req, res)=>{
    try {
        
        const q = `SELECT * FROM fuel ORDER BY id`
        const [fuel_types] = await db.query(q);

        res.json({
            success: true,
            fuel_types,
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
})

module.exports = router;
