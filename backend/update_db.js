const mysql = require('mysql2/promise');
require('dotenv').config();

async function update() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await connection.query(`ALTER TABLE tokens ADD COLUMN rating INT NULL, ADD COLUMN feedback_text TEXT NULL`);
    console.log('Columns rating and feedback_text added.');
  } catch (error) {
    if (error.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Columns already exist.');
    } else {
      console.error('Error during update:', error);
    }
  } finally {
    await connection.end();
  }
}

update();
