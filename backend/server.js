const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Database unavailable' });
  }
});

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'smart_queue_db',
};

let pool;

async function initPool() {
  try {
    pool = mysql.createPool(dbConfig);
    // Test the connection
    const [rows] = await pool.query('SELECT 1');
    console.log('Database pool initialized and connection verified.');
  } catch (err) {
    console.error('Critical database connection error:', err);
    process.exit(1);
  }
}

// 1. Book a new token
app.post('/api/tokens/book', async (req, res) => {
  const { customer_name, service_type } = req.body;
  if (!customer_name || !service_type) {
    return res.status(400).json({ error: 'Name and service type are required' });
  }

  try {
    const [rows] = await pool.query('SELECT MAX(token_number) as maxToken FROM tokens');
    const nextToken = (rows[0].maxToken || 0) + 1;

    const [result] = await pool.query(
      'INSERT INTO tokens (customer_name, service_type, token_number) VALUES (?, ?, ?)',
      [customer_name, service_type, nextToken]
    );

    res.status(201).json({
      id: result.insertId,
      token_number: nextToken,
      customer_name,
      service_type,
      status: 'waiting'
    });
  } catch (error) {
    console.error('Booking Error:', error);
    res.status(500).json({ error: 'Failed to book token' });
  }
});

// 2. Get status of a token
app.get('/api/tokens/status/:id', async (req, res) => {
  const tokenId = req.params.id;
  try {
    const [rows] = await pool.query('SELECT * FROM tokens WHERE id = ?', [tokenId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const token = rows[0];
    if (token.status !== 'waiting') {
      return res.json({ ...token, position: 0, estimated_wait: 0 });
    }

    const [countRows] = await pool.query(
      'SELECT COUNT(*) as position FROM tokens WHERE status = "waiting" AND id < ?',
      [tokenId]
    );

    const position = countRows[0].position + 1;
    const estimatedWait = countRows[0].position * 5;

    res.json({
      ...token,
      position,
      estimated_wait: estimatedWait
    });
  } catch (error) {
    console.error('Status Error:', error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

// 3. Get all waiting/serving tokens (Queue view)
app.get('/api/tokens/queue', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tokens WHERE status IN ("waiting", "serving") ORDER BY token_number ASC');
    res.json(rows);
  } catch (error) {
    console.error('Queue Error:', error);
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

// 4. Serve next token
app.patch('/api/tokens/serve/:id', async (req, res) => {
  const tokenId = req.params.id;
  try {
    await pool.query('UPDATE tokens SET status = "completed" WHERE status = "serving"');
    await pool.query('UPDATE tokens SET status = "serving" WHERE id = ?', [tokenId]);
    res.json({ message: 'Token is now being served' });
  } catch (error) {
    console.error('Serve Error:', error);
    res.status(500).json({ error: 'Failed to update token status' });
  }
});

// 5. Complete token
app.patch('/api/tokens/complete/:id', async (req, res) => {
  const tokenId = req.params.id;
  try {
    await pool.query('UPDATE tokens SET status = "completed" WHERE id = ?', [tokenId]);
    res.json({ message: 'Token marked as completed' });
  } catch (error) {
    console.error('Completion Error:', error);
    res.status(500).json({ error: 'Failed to complete token' });
  }
});

// 6. Submit feedback
app.post('/api/tokens/feedback/:id', async (req, res) => {
  const tokenId = req.params.id;
  const { rating, feedback_text } = req.body;
  try {
    await pool.query('UPDATE tokens SET rating = ?, feedback_text = ? WHERE id = ?', [rating, feedback_text, tokenId]);
    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Feedback Error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// 6b. Submit feedback by token_number
app.post('/api/tokens/feedback-by-number', async (req, res) => {
  const { token_number, rating, feedback_text } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE tokens SET rating = ?, feedback_text = ? WHERE token_number = ?',
      [rating, feedback_text, token_number]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }
    
    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Feedback By Number Error:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// 7. Get all customers (Full Admin History)
app.get('/api/admin/customers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tokens ORDER BY id DESC');
    console.log(`Fetched ${rows.length} customers for history.`);
    res.json(rows);
  } catch (error) {
    console.error('History Fetch Error:', error);
    res.status(500).json({ error: 'Failed to fetch customer list' });
  }
});

const PORT = process.env.PORT || 5000;
initPool()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`SmartQueue API running at http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((error) => {
    console.error('Unable to start SmartQueue API:', error.message);
    process.exit(1);
  });
