require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { initializeDatabase } = require('./database');
const { setupHandlers } = require('./handlers');
const { isDevelopment } = require('./utils');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

async function startBot() {
  await initializeDatabase();
  setupHandlers(bot);
  
  if (isDevelopment()) {
    console.log('Bot started in development mode');
    bot.on('polling_error', (error) => console.error(error));
    bot.on('webhook_error', (error) => console.error(error));
  }
}

startBot().catch(console.error);