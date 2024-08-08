const { Pool } = require('pg');

// Create a singleton pool instance
let pool;

const connectDB = async () => {
  if (!pool) { // Only create a new pool if one doesn't already exist
    pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

    try {
      await pool.connect();
      console.log('Connected to PostgreSQL database');
    } catch (err) {
      console.error('Connection error', err.stack);
      throw err;  // Rethrow error so it can be handled appropriately
    }
  }
  return pool;  // Return the singleton pool
};

const queryDatabase = async (query, params) => {
  const pool = await connectDB();
  const client = await pool.connect(); // Acquire a client from the pool
  try {
    const res = await client.query(query, params);
    return res.rows;
  } catch (err) {
    console.error('Query error', err.stack);
    throw err;
  } finally {
    client.release(); // Release the client back to the pool
  }
};

const disconnectDB = async () => {
  if (pool) {
    try {
      await pool.end(); // Close all clients in the pool
      console.log('Client disconnected');
      pool = null;  // Set to null after disconnecting
    } catch (err) {
      console.error('Disconnection error', err.stack);
    }
  }
};

// New function to create a user if they don't exist
const createUserIfNotExists = async (userId, userNickname, userName) => {
  const pool = await connectDB(); // Ensure connectDB is properly defined to return a pool
  const client = await pool.connect(); // Acquire a client from the pool
  try {
    // Step 1: Query the task table to get all task IDs
    const taskQuery = 'SELECT task_id FROM tasks';
    const taskResult = await client.query(taskQuery);

    // Step 2: Construct the initial task summary JSON array
    const initialTaskSummary = taskResult.rows.map(task => ({
      task_id: task.task_id,
      status: 'incomplete' // Set initial status for each task
    }));

    // Convert the task summary to a JSON string
    const taskSummaryJson = JSON.stringify(initialTaskSummary);

    // Step 3: Insert the user with the task summary
    const userInsertQuery = `
      INSERT INTO users (
        user_id, user_nickname, user_name, money, heart_limit_lvl, 
        regeneration_lvl, multitap_lvl, last_time_heart, 
        active_skin, max_skins, game_hearts, task_summary
      ) VALUES (
        $1, $2, $3, 0, 1, 
        1, 1, $4, 
        1, 1, 3, $5::jsonb
      )
      ON CONFLICT (user_id) DO NOTHING
    `;

    const currentDate = new Date().toISOString(); // Ensure the date is in ISO format

    await client.query(userInsertQuery, [userId, userNickname, userName, currentDate, taskSummaryJson]);

    console.log('User checked/created successfully with tasks');
  } catch (err) {
    console.error('Error creating user:', err.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(err.stack); // Optionally log stack trace in debug mode
    }
    throw err; // Consider rethrowing or handling specific errors
  } finally {
    client.release(); // Release the client back to the pool
  }
};

const writeRef = async (referralCode, userId) => {
  const pool = await connectDB(); // Ensure connectDB is properly defined to return a pool
  const client = await pool.connect(); // Acquire a client from the pool

  try {
    const referralDate = new Date();

    // Check if the user is already referred
    const checkQuery = `
      SELECT referral_id FROM referrals WHERE referred_user_id = $1
    `;
    const checkResult = await client.query(checkQuery, [userId]);

    if (checkResult.rows.length > 0) {
      console.log(`User ${userId} has already been referred.`);
      return; // Exit the function if the user has already been referred
    }

    // Insert the new referral
    const insertQuery = `
      INSERT INTO referrals (referrer_user_id, referred_user_id, referral_date)
      VALUES ($1, $2, $3) RETURNING referral_id
    `;
    const values = [referralCode, userId, referralDate];

    const result = await client.query(insertQuery, values);
    const referralId = result.rows[0].referral_id;
    await pool.query(
      'UPDATE users SET money = money + $1 WHERE user_id = $2 RETURNING *',
      [600, referralCode]
  );
    console.log(`Referral ${referralId} inserted for user ${userId} with referral code ${referralCode}`);
  } catch (err) {
    console.error('Error writing referral:', err.message);
    if (process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }
    throw err;
  } finally {
    client.release();
  }
};



module.exports = {
  connectDB,
  queryDatabase,
  disconnectDB,
  createUserIfNotExists,
  writeRef
};
