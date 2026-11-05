const mysql = require('mysql2/promise');
require('dotenv').config();

async function setup() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS smart_queue_db`);
    await connection.query(`USE smart_queue_db`);
    
    // Create base table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        service_type ENUM('General Service', 'Consultation', 'Payment') NOT NULL,
        token_number INT NOT NULL UNIQUE,
        status ENUM('waiting', 'serving', 'completed', 'cancelled') DEFAULT 'waiting',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure rating and feedback_text exist
    try { await connection.query(`ALTER TABLE tokens ADD COLUMN rating INT NULL`); } catch(e){}
    try { await connection.query(`ALTER TABLE tokens ADD COLUMN feedback_text TEXT NULL`); } catch(e){}

    console.log('Database and table setup successfully with all columns.');
  } catch (error) {
    console.error('Error during setup:', error);
  } finally {
    await connection.end();
  }
}

setup();
