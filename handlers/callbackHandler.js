const { 
  handleProductSelection,
  handlePaymentConfirmation,
  handleAdminActions,
  handleOrderCompletion
} = require('../services/orderService');
const { handleAdminProductActions } = require('../services/adminService');

async function handleCallbackQuery(bot, query) {
  const action = query.data;
  const userId = query.from.id;

  try {
    if (action.startsWith('product_')) {
      await handleProductSelection(bot, query);
    } else if (action.startsWith('confirm_')) {
      await handlePaymentConfirmation(bot, query);
    } else if (action.startsWith('admin_')) {
      await handleAdminActions(bot, query);
    } else if (action.startsWith('done_')) {
      await handleOrderCompletion(bot, query);
    } else if (action.startsWith('edit_product_') || 
               action.startsWith('delete_product_') ||
               action.startsWith('page_')) {
      await handleAdminProductActions(bot, query);
    }
  } catch (error) {
    console.error(error);
    bot.answerCallbackQuery(query.id, {
      text: '❌ Terjadi kesalahan',
      show_alert: true
    });
  }
}

module.exports = { handleCallbackQuery };