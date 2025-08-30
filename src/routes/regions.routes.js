const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async(req, res)=>{
    try {
        
        const q = `SELECT * FROM regions ORDER BY id`
        const [regions] = await db.query(q);

        res.json({
            success: true,
            regions,
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
})

module.exports = router;
