const TOKEN = '7124021613:AAECbEt-Cl_kmsdnxt_KpusZgvCY8FtRF_4';
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios'); // For making HTTP requests

const bot = new TelegramBot(TOKEN, { polling: true });

// Your web app URL
const WEB_APP_URL = 'http://127.0.0.1:5500/src/users/pages/index.html'; // Replace with your actual web app URL

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Open Web App',
            web_app: { url: WEB_APP_URL }
          }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, 'Welcome! Click the button below to open the web app.', options);
});


async function setMenuButton() {
  try {
    const response = await axios.post(`https://api.telegram.org/bot${TOKEN}/setChatMenuButton`, {
      menu_button: {
        type: 'web_app',
        text: 'Open Web App',
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

// Call the function to set the menu button
setMenuButton();
