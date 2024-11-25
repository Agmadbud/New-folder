module.exports = {
  ADMIN_USERNAME: 'senderchain',
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed'
  },
  ADMIN_STATES: {
    IDLE: 'idle',
    AWAITING_PRODUCT_NAME: 'awaiting_product_name',
    AWAITING_PRODUCT_PRICE: 'awaiting_product_price',
    AWAITING_NEW_NAME: 'awaiting_new_name',
    AWAITING_NEW_PRICE: 'awaiting_new_price'
  },
  MESSAGES: {
    WELCOME: (firstName, totalRefs) => (
      `🎉 Selamat datang di BeliRefferal Bot!\n\n` +
      `👋 Hai ${firstName},\n\n` +
      `🌟 Kami adalah platform terpercaya untuk membeli reff AirDrop Telegram.\n` +
      `✨ Total referral terjual: ${totalRefs} referral\n\n` +
      `🔥 Silakan pilih menu di bawah ini:`
    ),
    ORDER_COMPLETE: (amount, orderId) => (
      `🎉 *Pesanan Selesai!*\n\n` +
      `✅ Pembelian ${amount} referral telah berhasil diproses\n` +
      `🔗 Link referral Anda sudah kami proses\n` +
      `📝 Order ID: #${orderId}\n\n` +
      `Terima kasih telah menggunakan layanan kami! 🙏`
    ),
    CHANNEL_NOTIFICATION: (username, userId, amount, link, orderId) => (
      `🆕 *PESANAN BARU DIKONFIRMASI*\n\n` +
      `👤 User: [${username}](tg://user?id=${userId})\n` +
      `📦 Jumlah: ${amount} referral\n` +
      `🔗 Link: \`${link}\`\n` +
      `🆔 Order ID: #${orderId}`
    )
  }
};