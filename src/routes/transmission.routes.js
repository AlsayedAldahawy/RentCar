const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async(req, res)=>{
    try {
        
        const q = `SELECT * FROM transmission`
        const [rows] = await db.query(q)

        

    } catch (error) {
        
    }
})
