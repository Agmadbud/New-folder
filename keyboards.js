const mainButtons = [
  [
    { text: '🛒 Produk', callback_data: 'show_products' },
    { text: '📖 Cara Pembelian', callback_data: 'how_to_buy' }
  ],
  [
    { text: '💬 Hubungi Admin', url: 'https://t.me/senderchain' }
  ]
];

const adminButtons = [
  { text: '➕ Tambah Produk', callback_data: 'admin_add_product' },
  { text: '📊 Kelola Produk', callback_data: 'admin_manage_products' }
];

function getMainKeyboard() {
  return { inline_keyboard: mainButtons };
}

function getAdminKeyboard() {
  return {
    inline_keyboard: [
      ...mainButtons,
      adminButtons
    ]
  };
}

module.exports = {
  getMainKeyboard,
  getAdminKeyboard
};