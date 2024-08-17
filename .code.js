const { Router } = require('express');
const router = Router();
const pool = require('./db'); // налаштування з'єднання з БД
const axios = require('axios');

const TELEGRAM_BOT_TOKEN = 'токен_твоєго_бота';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getChatMember`;

router.get('/tasks', async (req, res) => {
  try {
    // Отримуємо ідентифікатор користувача з запиту, якщо він є
    const userId = req.query.userId;
    
    await pool.connect();
    const result = await pool.query('SELECT * FROM tasks;');
    const tasks = result.rows;
    
    // Проходимо по кожному завданню та перевіряємо підписку
    const tasksWithSubscriptionStatus = await Promise.all(tasks.map(async task => {
      // Перевірка підписки на канал через API Telegram
      if (userId) {
        try {
          const response = await axios.get(TELEGRAM_API_URL, {
            params: {
              chat_id: `@${task.link}`, // припускаємо, що у колонці `link` зберігається ID чи username каналу
              user_id: userId
            }
          });

          const isSubscribed = response.data.result.status === 'member' || response.data.result.status === 'administrator' || response.data.result.status === 'creator';
          return { ...task, isSubscribed };
        } catch (error) {
          console.error('Error checking subscription:', error);
          return { ...task, isSubscribed: false };
        }
      } else {
        return { ...task, isSubscribed: null }; // Якщо userId не надано, не перевіряємо підписку
      }
    }));

    // Відправляємо результат з перевіркою підписки
    res.json(tasksWithSubscriptionStatus);
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

module.exports = router;
