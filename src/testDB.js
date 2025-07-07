const db = require('./config/db');

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT NOW() AS now');
    console.log('✅ Successfully connected: ', rows[0].now);
  } catch (err) {
    console.error('❌ Faild to connect: ', err.message);
  }
}

testConnection();
