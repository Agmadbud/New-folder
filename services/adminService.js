const { db } = require('../database');
const { isAdmin } = require('../utils');
const { getProductsKeyboard } = require('../handlers/adminHandler');

async function handleAdminProductActions(bot, query) {
  const userId = query.from.id;
  if (!isAdmin(userId)) {
    await bot.answerCallbackQuery(query.id, {
      text: '⛔ Anda tidak memiliki akses admin',
      show_alert: true
    });
    return;
  }

  const action = query.data;

  if (action.startsWith('edit_product_')) {
    const productId = action.split('_')[2];
    await showEditOptions(bot, query, productId);
  } else if (action.startsWith('delete_product_')) {
    const productId = action.split('_')[2];
    await confirmDelete(bot, query, productId);
  } else if (action.startsWith('page_')) {
    const page = parseInt(action.split('_')[1]);
    await changePage(bot, query, page);
  }
}

async function showEditOptions(bot, query, productId) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: 'Edit Nama', callback_data: `edit_name_${productId}` },
        { text: 'Edit Harga', callback_data: `edit_price_${productId}` }
      ],
      [{ text: '« Kembali', callback_data: 'admin_manage_products' }]
    ]
  };

  await bot.editMessageText('✏️ Pilih yang ingin diubah:', {
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    reply_markup: keyboard
  });
}

async function confirmDelete(bot, query, productId) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Ya', callback_data: `confirm_delete_${productId}` },
        { text: '❌ Tidak', callback_data: 'admin_manage_products' }
      ]
    ]
  };

  await bot.editMessageText('❗ Apakah Anda yakin ingin menghapus produk ini?', {
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    reply_markup: keyboard
  });
}

async function changePage(bot, query, page) {
  const keyboard = await getProductsKeyboard(page);
  await bot.editMessageText('📋 Daftar Produk:', {
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    reply_markup: keyboard
  });
}

module.exports = {
  handleAdminProductActions
};