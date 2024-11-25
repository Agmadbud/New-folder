const { handleStart } = require('./startHandler');
const { handleCallbackQuery } = require('./callbackHandler');
const { handlePhoto } = require('./photoHandler');
const { handleAdminCommands } = require('./adminHandler');

function setupHandlers(bot) {
  bot.onText(/\/start/, (msg) => handleStart(bot, msg));
  bot.on('callback_query', (query) => handleCallbackQuery(bot, query));
  bot.on('photo', (msg) => handlePhoto(bot, msg));
  bot.onText(/\/admin/, (msg) => handleAdminCommands(bot, msg));
}

module.exports = { setupHandlers };