const { getMainKeyboard, getAdminKeyboard } = require('../keyboards');
const { isAdmin, getTotalProcessedOrders } = require('../utils');
const { MESSAGES } = require('../config/constants');

async function handleStart(bot, msg) {
  const { id: userId, first_name } = msg.from;
  const totalRefs = await getTotalProcessedOrders();
  
  const welcomeMessage = MESSAGES.WELCOME(first_name, totalRefs);
  const keyboard = isAdmin(userId) ? 
    await getAdminKeyboard() : 
    await getMainKeyboard();

  bot.sendMessage(userId, welcomeMessage, {
    parse_mode: 'HTML',
    reply_markup: keyboard
  });
}

module.exports = { handleStart };