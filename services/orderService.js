const { db } = require('../database');
const { generateQR, generateUniqueCode, formatPrice, isAdmin } = require('../utils');
const { MESSAGES, ORDER_STATUS } = require('../config/constants');
const fs = require('fs');
const path = require('path');

class OrderService {
  static async handleProductSelection(bot, query) {
    const productId = query.data.split('_')[1];
    const userId = query.from.id;

    const product = await this._getProduct(productId);
    if (!product) {
      await this._handleProductNotFound(bot, query);
      return;
    }

    await this._promptForAmount(bot, query, product);
    this._saveUserState(userId, product);
  }

  static async handlePaymentConfirmation(bot, query) {
    const orderId = query.data.split('_')[1];
    const adminId = query.from.id;

    if (!await this._validateAdmin(bot, query)) return;

    const order = await this._getOrder(orderId);
    if (!order) {
      await this._handleOrderNotFound(bot, query);
      return;
    }

    await this._updateOrderStatus(orderId, ORDER_STATUS.CONFIRMED);
    await bot.sendMessage(order.user_id, '✅ Pembayaran telah dikonfirmasi\nReferral akan segera diproses');
    await this._sendChannelNotification(bot, order);
  }

  static async handleOrderCompletion(bot, query) {
    const orderId = query.data.split('_')[1];
    if (!await this._validateAdmin(bot, query)) return;

    const order = await this._getOrder(orderId);
    if (!order) {
      await this._handleOrderNotFound(bot, query);
      return;
    }

    await this._updateOrderStatus(orderId, ORDER_STATUS.COMPLETED);
    await bot.sendMessage(
      order.user_id,
      MESSAGES.ORDER_COMPLETE(order.amount, orderId),
      { parse_mode: 'Markdown' }
    );
    await bot.answerCallbackQuery(query.id, {
      text: '✅ Pesanan telah diselesaikan',
      show_alert: true
    });
  }

  static async _processConfirmation(bot, order, adminId, query) {
    try {
      const qrPath = path.join(__dirname, '../qr/qr.png');
      await bot.sendPhoto(order.user_id, qrPath, {
        caption: `💳 Total pembayaran: Rp${formatPrice(order.amount + order.unique_code)}\n` +
                `🔢 Kode unik: ${order.unique_code}`
      });
    } catch (error) {
      console.error('Error sending QR:', error);
      await bot.sendMessage(order.user_id, '❌ Terjadi kesalahan saat memproses pembayaran');
    }
  }

  static async _sendChannelNotification(bot, order) {
    await bot.sendMessage(
      process.env.CHANNEL_ID,
      MESSAGES.CHANNEL_NOTIFICATION(
        order.username,
        order.user_id,
        order.amount,
        order.link,
        order.id
      ),
      {
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      }
    );
  }

  static async _updateOrderStatus(orderId, status) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, orderId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  static async _getProduct(productId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
        if (err) reject(err);
        else resolve(product);
      });
    });
  }

  static async _getOrder(orderId) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, order) => {
        if (err) reject(err);
        else resolve(order);
      });
    });
  }

  static async _handleProductNotFound(bot, query) {
    await bot.editMessageText('❌ Produk tidak tersedia', {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id
    });
  }

  static async _handleOrderNotFound(bot, query) {
    await bot.answerCallbackQuery(query.id, {
      text: '❌ Pesanan tidak ditemukan',
      show_alert: true
    });
  }

  static async _validateAdmin(bot, query) {
    if (!isAdmin(query.from.id)) {
      await bot.answerCallbackQuery(query.id, {
        text: '⛔ Anda tidak memiliki akses admin',
        show_alert: true
      });
      return false;
    }
    return true;
  }

  static async _saveUserState(userId, product) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO user_states (user_id, product_id, state) VALUES (?, ?, ?)',
        [userId, product.id, 'awaiting_link'],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  static async _promptForAmount(bot, query, product) {
    await bot.editMessageText(
      `📦 Produk: ${product.name}\n` +
      `💰 Harga: Rp${formatPrice(product.price)}\n\n` +
      `🔢 Masukkan jumlah yang ingin dibeli:`,
      {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id
      }
    );
  }
}

module.exports = OrderService;