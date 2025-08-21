const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async(req, res)=>{
    try {
        
        const q = `SELECT * FROM transmission ORDER BY id`
        const [transmission_types] = await db.query(q);

        res.json({
            success: true,
            transmission_types,
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
})

module.exports = router;
