const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { createUserIfNotExists, connectDB, writeRef } = require('../server/db.js');
require('dotenv').config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEB_APP_URL = process.env.WEB_APP_URL;

async function startTelegramBot() {
  try {
    await connectDB(); // Ensure the database is connected before doing anything

    const bot = new TelegramBot(TOKEN, { polling: true });

    // Handle /start command
    bot.onText(/\/start(.*)/, async (msg, match) => {
      const { id: chatId } = msg.chat;
      const { id: userId, username: userNickname = '', first_name: userName = '' } = msg.from;
      const referralCode = match[1]?.trim() || '';

      try {
        console.log(`User ${userId} - ${userNickname} created or already exists with referral code ${referralCode}`);

        const profilePhotos = await bot.getUserProfilePhotos(userId);
        const photoFileId = profilePhotos.photos.length > 0 ? profilePhotos.photos[0][0].file_id : null;

        await createUserIfNotExists(userId, userNickname, userName, profilePhotos);

        const options = {
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Start Game', web_app: { url: WEB_APP_URL } }],
              [{ text: 'Join', web_app: { url: WEB_APP_URL } }],
              [{ text: 'Admin', web_app: { url: `${WEB_APP_URL}/admin` } }]
            ]
          }
        };

        await bot.sendMessage(chatId, 'Welcome! Click the button below to open the web app.', options);

        if (referralCode) {
          await writeRef(referralCode, userId);
          console.log(`Referral code ${referralCode} used by ${userId}`);
        }
      } catch (error) {
        console.error('Error handling /start:', error);
        await bot.sendMessage(chatId, 'An error occurred while processing your request.');
      }
    });

    // Handle /ref command
    bot.onText(/\/ref/, async (msg) => {
      const { id: chatId } = msg.chat;
      const { id: userId } = msg.from;

      const referralLink = `https://t.me/ZombieTapTest_bot?start=${userId}`;
      await bot.sendMessage(chatId, `Your referral link: ${referralLink}`);
    });

    // Set the menu button
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

    await setMenuButton();
  } catch (error) {
    console.error('Error starting Telegram bot:', error);
  }
}

module.exports = { startTelegramBot };
