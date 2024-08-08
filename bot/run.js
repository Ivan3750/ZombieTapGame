const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { createUserIfNotExists, connectDB, writeRef } = require('../server/db.js'); // Import database functions
require('dotenv').config();  // Load environment variables

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL; // Your web app URL

async function startTelegramBot() {
  await connectDB(); // Ensure the database is connected before doing anything with it

  const bot = new TelegramBot(TOKEN, { polling: true });

  // Handle /start command
  bot.onText(/\/start(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userNickname = msg.from.username || ''; // Handle case where username may not exist
    const userName = msg.from.first_name || ''; // Handle case where first name may not exist
    const referralCode = match[1]?.trim() || ''; // Handle missing referral code

    try {
      await createUserIfNotExists(userId, userNickname, userName);
      console.log(`User ${userId} - ${userNickname} created or already exists with referral code ${referralCode}`);

      const options = {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Start Game', web_app: { url: WEB_APP_URL } }],
            [{ text: 'Join', web_app: { url: WEB_APP_URL } }]
          ]
        }
      };

      await bot.sendMessage(chatId, 'Welcome! Click the button below to open the web app.', options);

      if (referralCode) {
        await writeRef(referralCode, userId);
      }
    } catch (error) {
      await bot.sendMessage(chatId, 'An error occurred while processing your request.');
      console.error('Error handling /start:', error);
    }
  });

  bot.onText(/\/ref/, async(msg, match)=>{
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userNickname = msg.from.username || ''; // Handle case where username may not exist
    const userName = msg.from.first_name || ''; // Handle case where first name may not exist

    bot.sendMessage(chatId, `Your referral link: https://t.me/ZombieTapTest_bot?start=${userId}`);
  })

  async function setMenuButton() {
    try {
      const response = await axios.post(`https://api.telegram.org/bot${TOKEN}/setChatMenuButton`, {
        menu_button: {
          type: 'web_app',
          text: 'game',
          web_app: {
            url: WEB_APP_URL
          }
        }
      });
      console.log('Menu button set:', response.data);
    } catch (error) {
      console.error('Error setting menu button:', error);
    }
  }

  setMenuButton();
}

module.exports = { startTelegramBot };
