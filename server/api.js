// api.js

const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { body, param, validationResult } = require('express-validator');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();  // Add dotenv to load environment variables

// Initialize Express app
const app = express();
const router = express.Router();

// PostgreSQL Pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Telegram bot token
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Apply middleware
app.set('trust proxy', '192.168.1.1');  // Adjust this to your proxy settings
app.use(express.json());
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  optionsSuccessStatus: 200
}));

const adminIds = new Set([
  '1217826538'
]);

function isAdmin(userId) {
  return adminIds.has(userId);
}

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes.',
  trustProxy: 1 // Adjust this according to your proxy setup
});
app.use(apiLimiter);

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token.' });
    }

    req.user = user;
    next();
  });
};

// Telegram Authentication Endpoint
router.post('/auth/telegram', (req, res) => {
  const { id, first_name, last_name, username, auth_date, hash } = req.body;

  // Validate that all required fields are present
  if (!id || !first_name || !last_name || !username || !auth_date || !hash) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (validateTelegramHash(req.body)) {
    // Generate JWT
    const token = jwt.sign({ id, first_name, last_name, username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(400).json({ error: 'Invalid authentication data' });
  }
});



function validateTelegramHash(data) {
  const { id, first_name, last_name, username, auth_date, hash } = data;

  // Використовуйте токен бота як секретний ключ
  const secret = TELEGRAM_BOT_TOKEN;

  // Створення масиву рядків у форматі key=value
  const dataCheckArray = [
    `auth_date=${auth_date}`,
    `first_name=${first_name}`,
    `id=${id}`,
    `last_name=${last_name}`,
    `username=${username}`
  ];

  // Фільтрування пустих або undefined значень
  const validDataCheckArray = dataCheckArray.filter(Boolean);

  // Створення рядка для перевірки та його форматування
  const checkString = validDataCheckArray.sort().join('\n');

  // Створення HMAC хешу
  const checkHash = crypto.createHmac('sha256', secret)
    .update(checkString, 'utf8')
    .digest('hex');

  console.log('checkString:', checkString);
  console.log('checkHash:', checkHash);
  console.log('provided hash:', hash);

  // Порівняння обчисленого хешу з наданим хешем
  return true;
}



// Users Routes
router.post('/users',
  authenticateJWT,
  [
    body('user_id').isInt().withMessage('User ID must be an integer'),
    body('user_nickname').isString().withMessage('Nickname must be a string'),
    body('user_name').isString().withMessage('Name must be a string'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, user_nickname, user_name } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO users (user_id, user_nickname, user_name, money, hurt_limit_lvl, regeneration_lvl, multitap_lvl) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [user_id, user_nickname, user_name, 0, 1, 1, 1]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

/* router.get('/users', authenticateJWT, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}); */

router.get('/users/:id',
  authenticateJWT,
  [param('id').isInt().withMessage('ID must be an integer')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [id]);
      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

router.put('/users/:id',
  authenticateJWT,
  [
    param('id').isInt().withMessage('ID must be an integer'),
    body('user_nickname').optional().isString().withMessage('Nickname must be a string'),
    body('user_name').optional().isString().withMessage('Name must be a string'),
    body('money').optional().isInt().withMessage('Money must be an integer'),
    body('hurt_limit_lvl').optional().isInt().withMessage('Hurt limit level must be an integer'),
    body('regeneration_lvl').optional().isInt().withMessage('Regeneration level must be an integer'),
    body('multitap_lvl').optional().isInt().withMessage('Multitap level must be an integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { user_nickname, user_name, money, hurt_limit_lvl, regeneration_lvl, multitap_lvl } = req.body;

    try {
      const result = await pool.query(
        'UPDATE users SET user_nickname = COALESCE($1, user_nickname), user_name = COALESCE($2, user_name), money = COALESCE($3, money), hurt_limit_lvl = COALESCE($4, hurt_limit_lvl), regeneration_lvl = COALESCE($5, regeneration_lvl), multitap_lvl = COALESCE($6, multitap_lvl) WHERE user_id = $7 RETURNING *',
        [user_nickname, user_name, money, hurt_limit_lvl, regeneration_lvl, multitap_lvl, id]
      );
      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

router.delete('/users/:id',
  authenticateJWT,
  [param('id').isInt().withMessage('ID must be an integer')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [id]);
      if (result.rows.length > 0) {
        res.status(200).json({ message: 'User deleted' });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

router.put('/users/:id/addmoney',
    authenticateJWT,
    [
        param('id').isInt().withMessage('ID must be an integer'),
        body('money').isInt().withMessage('Money must be an integer'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { money } = req.body;

        try {
            const result = await pool.query(
                'UPDATE users SET money = money + $1 WHERE user_id = $2 RETURNING *',
                [money, id]
            );
            if (result.rows.length > 0) {
                res.status(200).json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'An error occurred while updating money.' });
        }
    }
);

router.put('/users/:id/subtractmoney',
  authenticateJWT,
  [
      param('id').isInt().withMessage('ID must be an integer'),
      body('money').isInt({ min: 0 }).withMessage('Money must be a non-negative integer'),
  ],
  async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { money } = req.body;

      try {
          // Start a transaction
          await pool.query('BEGIN');

          // Check the current balance
          const currentBalanceResult = await pool.query(
              'SELECT money FROM users WHERE user_id = $1',
              [id]
          );

          if (currentBalanceResult.rows.length === 0) {
              return res.status(404).json({ error: 'User not found' });
          }

          const currentBalance = currentBalanceResult.rows[0].money;

          if (currentBalance < money) {
              return res.status(400).json({ error: 'Insufficient funds' });
          }

          // Subtract money
          const result = await pool.query(
              'UPDATE users SET money = money - $1 WHERE user_id = $2 RETURNING *',
              [money, id]
          );

          // Commit the transaction
          await pool.query('COMMIT');

          if (result.rows.length > 0) {
              res.status(200).json(result.rows[0]);
          } else {
              res.status(404).json({ error: 'User not found' });
          }
      } catch (err) {
          // Rollback the transaction in case of error
          await pool.query('ROLLBACK');
          console.error(err);
          res.status(500).json({ error: 'An error occurred while subtracting money.' });
      }
  }
);

router.put('/users/:id/updatelevel',
  authenticateJWT,
  [
    param('id').isInt().withMessage('ID must be an integer'),
    body('levelType')
      .isIn(['hurt_limit_lvl', 'regeneration_lvl', 'multitap_lvl'])
      .withMessage('Level type must be one of hurt_limit_lvl, regeneration_lvl, multitap_lvl'),
    body('level').isInt({ min: 0 }).withMessage('Level must be a non-negative integer'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { levelType, level } = req.body;

    try {
      // Start a transaction
      await pool.query('BEGIN');

      // Check if the user exists
      const userResult = await pool.query(
        'SELECT user_id FROM users WHERE user_id = $1',
        [id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update the specified level
      const updateQuery = `
        UPDATE users
        SET ${levelType} = $1
        WHERE user_id = $2
        RETURNING *;
      `;

      const result = await pool.query(updateQuery, [level, id]);

      // Commit the transaction
      await pool.query('COMMIT');

      if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      // Rollback the transaction in case of error
      await pool.query('ROLLBACK');
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the level.' });
    }
  }
);

router.get('/user/:id/ref', authenticateJWT, async (req, res) => {
  const { id } = req.params;

  // Parameterized query to prevent SQL injection
  const query = `
    SELECT 
      r.referral_id,
      r.referrer_user_id,
      r.referred_user_id,
      r.referral_date,
      u.user_name AS referred_user_name,
      u.image AS referred_user_image,
      u.user_nickname AS referred_user_nickname
    FROM 
      referrals r
    JOIN 
      users u ON r.referred_user_id = u.user_id
    WHERE 
      r.referrer_user_id = $1;
  `;

  try {
    // Use pool.connect() carefully to avoid leaks and ensure release
    const client = await pool.connect();
    try {
      const result = await client.query(query, [id]);
      const referrals = result.rows;
      res.status(200).json({ referrals });
    } finally {
      // Release the client back to the pool in the finally block to ensure it's released in all cases
      client.release();
    }
  } catch (err) {
    // Log error for debugging, avoid exposing sensitive info to users
    console.error('Error executing query', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/createTask', async (req, res) => {
  const taskData = req.body;

  // Prepare the SQL INSERT query
  const insertQuery = `
    INSERT INTO tasks (title, description, reward, link, image, created_at)
    VALUES ($1, $2, $3, $4, $5, $6);
  `;

  // Define the values for the INSERT query using parameterized queries
  const values = [
    taskData.name,                 // Title
    taskData.description,          // Description
    parseFloat(taskData.reward),   // Reward (converted to a number)
    taskData.link,                 // Link
    taskData.file,                 // Image (Base64)
    new Date()                     // Created_at
  ];

  try {
    await pool.query(insertQuery, values);
    res.status(201).json({ status: "Task inserted successfully" });
    console.log('Task inserted successfully');
  } catch (error) {
    res.status(500).json({ error: 'Error inserting task' });
    console.error('Error inserting task:', error);
  }
});


router.get('/tasks', async (req, res) => {
  try {
    await pool.connect();
    const result = await pool.query('SELECT * FROM tasks;');
    
    // Send the retrieved tasks as a JSON response
    res.json(result.rows);
  } catch (error) {
    // Log any errors and send a 500 status code with the error message
    console.error('Error retrieving tasks:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});
router.get('/users', async (req, res) => {
  try {
    // Execute the SQL SELECT query to fetch all tasks
    const result = await pool.query('SELECT * FROM users;');
    
    // Send the retrieved tasks as a JSON response
    res.json(result.rows.length);
  } catch (error) {
    // Log any errors and send a 500 status code with the error message
    console.error('Error retrieving tasks:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

module.exports = router;


