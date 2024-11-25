const { db } = require('../database');
const { isAdmin } = require('../utils');
const { MESSAGES } = require('../config/constants');

async function handlePhoto(bot, msg) {
  const userId = msg.from.id;
  const photo = msg.photo[msg.photo.length - 1];
  
  const order = await getPendingOrder(userId);
  if (!order) {
    await bot.sendMessage(userId, '❌ Tidak ada pesanan yang menunggu pembayaran');
    return;
  }

  await updateOrderWithProof(order.id, photo.file_id);
  await notifyAdmin(bot, order, photo.file_id);
  await bot.sendMessage(userId, '✅ Bukti pembayaran diterima\n\nPembayaran akan segera dicek oleh admin');
}

async function getPendingOrder(userId) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM orders WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT 1',
      [userId, 'pending'],
      (err, order) => {
        if (err) reject(err);
        else resolve(order);
      }
    );
  });
}

async function updateOrderWithProof(orderId, proofId) {
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE orders SET payment_proof = ? WHERE id = ?',
      [proofId, orderId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

async function notifyAdmin(bot, order, proofId) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Konfirmasi', callback_data: `confirm_${order.id}` },
        { text: '❌ Tolak', callback_data: `reject_${order.id}` }
      ],
      [
        { text: '✨ Done', callback_data: `done_${order.id}` }
      ]
    ]
  };

  const message = 
    `🆕 *Bukti Pembayaran Baru*\n\n` +
    `👤 User: [${order.username}](tg://user?id=${order.user_id})\n` +
    `💰 Total: Rp${order.amount + order.unique_code}\n` +
    `🔢 Kode Unik: ${order.unique_code}\n` +
    `🔗 Link: \`${order.link}\`\n` +
    `📝 Order ID: #${order.id}`;

  await bot.sendPhoto(process.env.ADMIN_ID, proofId, {
    caption: message,
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
}

module.exports = { handlePhoto };