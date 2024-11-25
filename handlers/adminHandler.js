const { db } = require('../database');
const { isAdmin } = require('../utils');
const { ADMIN_STATES } = require('../config/constants');

let adminStates = new Map();

async function handleAdminCommands(bot, msg) {
  const userId = msg.from.id;
  if (!isAdmin(userId)) return;

  const state = adminStates.get(userId) || {};
  
  if (state.awaitingProductName) {
    await handleProductName(bot, msg, userId);
  } else if (state.awaitingProductPrice) {
    await handleProductPrice(bot, msg, userId);
  } else if (state.awaitingNewName) {
    await handleProductNameUpdate(bot, msg, userId);
  } else if (state.awaitingNewPrice) {
    await handleProductPriceUpdate(bot, msg, userId);
  }
}

async function handleProductName(bot, msg, userId) {
  const productName = msg.text;
  adminStates.set(userId, { 
    ...adminStates.get(userId), 
    productName,
    awaitingProductName: false,
    awaitingProductPrice: true 
  });
  
  await bot.sendMessage(userId, '💰 Masukkan harga produk:');
}

async function handleProductPrice(bot, msg, userId) {
  const price = parseInt(msg.text);
  if (isNaN(price)) {
    await bot.sendMessage(userId, '❌ Harga harus berupa angka');
    return;
  }

  const state = adminStates.get(userId);
  await addProduct(state.productName, price);
  
  adminStates.delete(userId);
  await bot.sendMessage(userId, '✅ Produk berhasil ditambahkan!');
}

async function addProduct(name, price) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO products (name, price) VALUES (?, ?)',
      [name, price],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

async function getProductsKeyboard(page = 0) {
  const productsPerPage = 5;
  const offset = page * productsPerPage;
  
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM products LIMIT ? OFFSET ?',
      [productsPerPage + 1, offset],
      (err, products) => {
        if (err) {
          reject(err);
          return;
        }

        const hasNextPage = products.length > productsPerPage;
        const currentPageProducts = products.slice(0, productsPerPage);

        const keyboard = currentPageProducts.map(product => ([
          { text: `${product.name} - Rp${product.price}`, callback_data: `product_${product.id}` },
          { text: '✏️', callback_data: `edit_product_${product.id}` },
          { text: '🗑️', callback_data: `delete_product_${product.id}` }
        ]));

        const navigationRow = [];
        if (page > 0) {
          navigationRow.push({ text: '⬅️ Sebelumnya', callback_data: `page_${page - 1}` });
        }
        if (hasNextPage) {
          navigationRow.push({ text: 'Selanjutnya ➡️', callback_data: `page_${page + 1}` });
        }

        if (navigationRow.length > 0) {
          keyboard.push(navigationRow);
        }

        resolve({ inline_keyboard: keyboard });
      }
    );
  });
}

module.exports = {
  handleAdminCommands,
  getProductsKeyboard
};