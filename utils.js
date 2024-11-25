const qrcode = require('qrcode');
const moment = require('moment');
const { db } = require('./database');

const isDevelopment = () => process.env.NODE_ENV === 'development';
const isAdmin = (userId) => userId.toString() === process.env.ADMIN_ID;

function generateUniqueCode() {
  return Math.floor(Math.random() * 900) + 100;
}

async function generateQR(text) {
  try {
    return await qrcode.toBuffer(text);
  } catch (error) {
    console.error('QR Generation Error:', error);
    throw error;
  }
}

function formatPrice(price) {
  return new Intl.NumberFormat('id-ID').format(price);
}

async function getTotalProcessedOrders() {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT SUM(amount) as total FROM orders WHERE status = 'completed'`,
      (err, row) => {
        if (err) reject(err);
        else resolve(row.total || 0);
      }
    );
  });
}

module.exports = {
  isDevelopment,
  isAdmin,
  generateUniqueCode,
  generateQR,
  formatPrice,
  getTotalProcessedOrders
};