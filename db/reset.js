const pool = require('../src/config/db');
const seed = require('./seed');

const resetDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('Truncating all tables...');
    await client.query('TRUNCATE TABLE users, destinations, security_factors, incidents, incident_media, reviews, gallery RESTART IDENTITY CASCADE');
    console.log('Tables truncated successfully.');

    console.log('Running seeder...');
    await seed();
    console.log('Seeder finished successfully.');

  } catch (err) {
    console.error('Error resetting database:', err.message);
  } finally {
    client.release();
    pool.end();
  }
};

resetDatabase();
