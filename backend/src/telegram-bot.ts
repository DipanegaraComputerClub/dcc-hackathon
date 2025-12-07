/**
 * ============================================
 * TELEGRAM BOT SERVICE
 * ============================================
 * Bot untuk Boss UMKM:
 * - Lihat laporan keuangan bulanan
 * - Kirim evaluasi ke admin
 * - Cek ringkasan bisnis
 * ============================================
 */

import TelegramBot from 'node-telegram-bot-api';
import { supabase } from './supabase';
import { calculateBusinessMetrics } from './dapur-umkm';

// Initialize bot
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

// In production (Vercel), don't use polling - use webhook mode
const bot = TELEGRAM_BOT_TOKEN 
  ? new TelegramBot(TELEGRAM_BOT_TOKEN, { 
      polling: !isProduction // Only poll in development
    }) 
  : null;

// Store authorized users (boss chat IDs)
let authorizedUsers: { [chatId: number]: string } = {}; // chatId -> profileId

// ============================================
// BOT COMMANDS
// ============================================

export function initTelegramBot() {
  if (!bot) {
    console.warn('⚠️ Telegram Bot Token not configured. Bot disabled.');
    return;
  }

  console.log('🤖 Telegram Bot started...');

  // /start - Welcome message
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    
    await bot.sendMessage(chatId, `
🏪 *Selamat datang di TABE AI Bot!*

Bot ini membantu Boss UMKM untuk:
• 📊 Lihat laporan keuangan
• 📝 Kirim evaluasi ke tim
• 💰 Cek ringkasan bisnis

*Cara pakai:*
1. Login dulu: /login [kode_bisnis]
2. Lihat menu: /menu

_Contoh: /login ABC123_
    `, { parse_mode: 'Markdown' });
  });

  // /login [profile_id] - Login boss
  bot.onText(/\/login (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const profileId = match?.[1]?.trim();

    if (!profileId) {
      await bot.sendMessage(chatId, '❌ Format salah! Gunakan: /login [kode_bisnis]');
      return;
    }

    // Verify profile exists
    const { data: profile, error } = await supabase
      .from('umkm_profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error || !profile) {
      await bot.sendMessage(chatId, '❌ Kode bisnis tidak valid! Hubungi admin untuk mendapat kode.');
      return;
    }

    // Save authorized user
    authorizedUsers[chatId] = profileId;
    
    await bot.sendMessage(chatId, `
✅ *Login Berhasil!*

Bisnis: ${profile.business_name}
Kategori: ${profile.category}

Gunakan /menu untuk lihat opsi yang tersedia.
    `, { parse_mode: 'Markdown' });
  });

  // /menu - Show menu
  bot.onText(/\/menu/, async (msg) => {
    const chatId = msg.chat.id;

    if (!authorizedUsers[chatId]) {
      await bot.sendMessage(chatId, '❌ Anda belum login! Gunakan /login [kode_bisnis]');
      return;
    }

    const keyboard = {
      keyboard: [
        [{ text: '📊 Laporan Bulan Ini' }, { text: '💰 Ringkasan Bisnis' }],
        [{ text: '📥 Transaksi Masuk' }, { text: '📤 Transaksi Keluar' }],
        [{ text: '📝 Kirim Komentar' }, { text: '📈 Laporan Custom' }],
        [{ text: '❓ Help' }, { text: '🚪 Logout' }]
      ],
      resize_keyboard: true
    };

    await bot.sendMessage(chatId, 
      '*📱 Menu TABE AI Bot*\n\nPilih opsi di bawah atau ketik perintah:', 
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );
  });

  // /laporan - Get monthly report
  bot.onText(/\/laporan/, async (msg) => {
    await handleLaporanCommand(msg);
  });

  // Handle keyboard buttons
  bot.on('message', async (msg) => {
    if (!msg.text) return;
    
    const chatId = msg.chat.id;
    const text = msg.text;

    // Skip if it's a command
    if (text.startsWith('/')) return;

    if (!authorizedUsers[chatId]) {
      await bot.sendMessage(chatId, '❌ Anda belum login! Gunakan /login [kode_bisnis]');
      return;
    }

    switch (text) {
      case '📊 Laporan Bulan Ini':
        await handleLaporanCommand(msg);
        break;
      
      case '💰 Ringkasan Bisnis':
        await handleRingkasanCommand(msg);
        break;
      
      case '📥 Transaksi Masuk':
        await handleTransaksiMasukCommand(msg);
        break;
      
      case '📤 Transaksi Keluar':
        await handleTransaksiKeluarCommand(msg);
        break;
      
      case '📝 Kirim Komentar':
        await bot.sendMessage(chatId, 
          '📝 *Kirim Komentar/Evaluasi*\n\nKetik komentar Anda, lalu saya akan menyimpannya untuk tim admin.\n\nFormat:\n`/komentar [pesan Anda]`\n\nContoh:\n`/komentar Penjualan bulan ini bagus, tingkatkan produksi!`',
          { parse_mode: 'Markdown' }
        );
        break;
      
      case '📈 Laporan Custom':
        await bot.sendMessage(chatId,
          '📈 *Laporan Custom*\n\nKetik: `/laporan [bulan] [tahun]`\n\nContoh:\n`/laporan 11 2025` untuk November 2025',
          { parse_mode: 'Markdown' }
        );
        break;
      
      case '❓ Help':
        await bot.sendMessage(chatId, `
📖 *Panduan Penggunaan*

*Perintah Tersedia:*
/login [kode] - Login
/menu - Tampilkan menu
/laporan - Laporan bulan ini
/masuk - Transaksi masuk (5 terbaru)
/keluar - Transaksi keluar (5 terbaru)
/ringkasan - Ringkasan bisnis
/komentar [pesan] - Kirim komentar
/logout - Keluar

*Tips:*
• Gunakan tombol keyboard untuk akses cepat
• Laporan otomatis untuk bulan berjalan
• Komentar akan dikirim ke dashboard admin
        `, { parse_mode: 'Markdown' });
        break;
      
      case '🚪 Logout':
        delete authorizedUsers[chatId];
        await bot.sendMessage(chatId, '✅ Anda telah logout. Gunakan /login untuk masuk lagi.');
        break;
    }
  });

  // /komentar [message] - Send comment/evaluation to admin
  bot.onText(/\/komentar (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const profileId = authorizedUsers[chatId];

    if (!profileId) {
      await bot.sendMessage(chatId, '❌ Anda belum login! Gunakan /login [kode_bisnis]');
      return;
    }

    const commentText = match?.[1]?.trim();
    if (!commentText) {
      await bot.sendMessage(chatId, '❌ Komentar tidak boleh kosong!');
      return;
    }

    try {
      console.log(`💬 Saving comment - Profile: ${profileId}, User: ${msg.from?.first_name}, Message: ${commentText}`);
      
      // Save comment to database
      const { data, error } = await supabase
        .from('umkm_evaluations')
        .insert({
          profile_id: profileId,
          message: commentText,
          sender_name: msg.from?.first_name || 'Boss',
          telegram_chat_id: chatId,
          status: 'unread'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Comment saved:', data);

      await bot.sendMessage(chatId, 
        '✅ *Komentar terkirim!*\n\nTim admin akan melihat komentar Anda di dashboard.\n\n📱 Lihat di: /menu → Dashboard Admin → Evaluasi',
        { parse_mode: 'Markdown' }
      );
    } catch (error: any) {
      console.error('❌ Error saving comment:', error);
      const errorMsg = error?.message || 'Unknown error';
      await bot.sendMessage(chatId, 
        `❌ Gagal mengirim komentar.\n\nError: ${errorMsg}\n\nCoba lagi dengan: /komentar [pesan Anda]`
      );
    }
  });

  // /evaluasi - alias for /komentar
  bot.onText(/\/evaluasi (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const profileId = authorizedUsers[chatId];

    if (!profileId) {
      await bot.sendMessage(chatId, '❌ Anda belum login! Gunakan /login [kode_bisnis]');
      return;
    }

    const evaluationText = match?.[1]?.trim();
    if (!evaluationText) {
      await bot.sendMessage(chatId, '❌ Evaluasi tidak boleh kosong!');
      return;
    }

    try {
      console.log(`💬 Saving evaluation - Profile: ${profileId}, User: ${msg.from?.first_name}, Message: ${evaluationText}`);
      
      const { data, error } = await supabase
        .from('umkm_evaluations')
        .insert({
          profile_id: profileId,
          message: evaluationText,
          sender_name: msg.from?.first_name || 'Boss',
          telegram_chat_id: chatId,
          status: 'unread'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      console.log('✅ Evaluation saved:', data);

      await bot.sendMessage(chatId, 
        '✅ *Evaluasi terkirim!*\n\nTim admin akan melihat evaluasi Anda di dashboard.\n\n📱 Lihat di: Dashboard Admin → Evaluasi',
        { parse_mode: 'Markdown' }
      );
    } catch (error: any) {
      console.error('❌ Error saving evaluation:', error);
      const errorMsg = error?.message || 'Unknown error';
      await bot.sendMessage(chatId, 
        `❌ Gagal mengirim evaluasi.\n\nError: ${errorMsg}\n\nCoba lagi dengan: /evaluasi [pesan Anda]`
      );
    }
  });

  // /ringkasan - Business summary
  bot.onText(/\/ringkasan/, async (msg) => {
    await handleRingkasanCommand(msg);
  });

  // /masuk - Show income transactions
  bot.onText(/\/masuk/, async (msg) => {
    await handleTransaksiMasukCommand(msg);
  });

  // /keluar - Show expense transactions
  bot.onText(/\/keluar/, async (msg) => {
    await handleTransaksiKeluarCommand(msg);
  });

  // /logout
  bot.onText(/\/logout/, (msg) => {
    const chatId = msg.chat.id;
    delete authorizedUsers[chatId];
    bot.sendMessage(chatId, '✅ Anda telah logout. Gunakan /login untuk masuk lagi.');
  });
}

// ============================================
// API HELPERS
// ============================================

export async function sendEvaluationNotification(profileId: string, message: string) {
  if (!bot) return;
  
  // Find boss chat ID for this profile
  const chatId = Object.keys(authorizedUsers).find(
    key => authorizedUsers[Number(key)] === profileId
  );

  if (chatId) {
    await bot.sendMessage(Number(chatId), 
      `✅ *Admin telah membaca evaluasi Anda!*\n\n"${message}"\n\n_Status: Dibaca_`,
      { parse_mode: 'Markdown' }
    );
  }
}

export function getTelegramBot() {
  return bot;
}

// ============================================
// WEBHOOK MODE HANDLER (for production/serverless)
// ============================================
export async function handleTelegramWebhook(update: any) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('Bot token not configured');
    return;
  }

  // Create bot instance for webhook (no polling)
  const webhookBot = new TelegramBot(TELEGRAM_BOT_TOKEN);

  try {
    // Handle different types of updates
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = msg.text || '';

      console.log('📱 Webhook message:', { chatId, text: text.substring(0, 50) });

      // Handle commands
      if (text.startsWith('/start')) {
        await handleStartCommand(webhookBot, msg);
      } else if (text.startsWith('/login')) {
        await handleLoginCommand(webhookBot, msg);
      } else if (text.startsWith('/menu')) {
        await handleMenuCommand(webhookBot, msg);
      } else if (text.startsWith('/laporan')) {
        await handleLaporanCommand(webhookBot, msg);
      } else if (text.startsWith('/masuk')) {
        await handleTransaksiMasukCommand(webhookBot, msg);
      } else if (text.startsWith('/keluar')) {
        await handleTransaksiKeluarCommand(webhookBot, msg);
      } else if (text.startsWith('/komentar')) {
        await handleKomentarCommand(webhookBot, msg);
      } else {
        // Unknown command
        await webhookBot.sendMessage(chatId, 
          '❓ Perintah tidak dikenali.\n\nGunakan /menu untuk melihat daftar perintah.'
        );
      }
    } else if (update.callback_query) {
      // Handle callback queries if needed
      console.log('Callback query:', update.callback_query);
    } else {
      console.log('Unknown update type:', Object.keys(update));
    }
  } catch (error) {
    console.error('Error processing webhook update:', error);
    throw error;
  }
}

// Helper functions for webhook handlers
async function handleStartCommand(bot: TelegramBot, msg: any) {
  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, `
🏪 *Selamat datang di TABE AI Bot!*

Bot ini membantu Boss UMKM untuk:
• 📊 Lihat laporan keuangan
• 📝 Kirim evaluasi ke tim
• 💰 Cek ringkasan bisnis

*Cara pakai:*
1. Login dulu: /login [kode_bisnis]
2. Lihat menu: /menu

Hubungi admin jika butuh bantuan! 💬
  `, { parse_mode: 'Markdown' });
}

async function handleLoginCommand(bot: TelegramBot, msg: any) {
  const chatId = msg.chat.id;
  const text = msg.text || '';
  const businessCode = text.split(' ')[1];

  if (!businessCode) {
    await bot.sendMessage(chatId, '❌ Format: /login [kode_bisnis]\n\nContoh: /login COTOMKS01');
    return;
  }

  // Find profile by business code
  const { data: profiles } = await supabase
    .from('umkm_profiles')
    .select('id, business_name')
    .ilike('business_name', `%${businessCode}%`)
    .limit(1);

  if (!profiles || profiles.length === 0) {
    await bot.sendMessage(chatId, '❌ Kode bisnis tidak ditemukan. Coba lagi atau hubungi admin.');
    return;
  }

  const profile = profiles[0];
  authorizedUsers[chatId] = profile.id;

  await bot.sendMessage(chatId, 
    `✅ *Login berhasil!*\n\n🏪 Bisnis: ${profile.business_name}\n\nGunakan /menu untuk melihat opsi.`,
    { parse_mode: 'Markdown' }
  );
}

async function handleMenuCommand(bot: TelegramBot, msg: any) {
  const chatId = msg.chat.id;
  
  if (!authorizedUsers[chatId]) {
    await bot.sendMessage(chatId, '❌ Anda belum login. Gunakan /login [kode_bisnis]');
    return;
  }

  await bot.sendMessage(chatId, `
📋 *MENU UTAMA*

Pilih opsi:
/laporan - 📊 Laporan Keuangan Bulan Ini
/masuk - 💰 10 Transaksi Masuk Terakhir
/keluar - 💸 10 Transaksi Keluar Terakhir
/komentar [pesan] - 📝 Kirim Evaluasi ke Admin

Contoh: /komentar Stok bahan baku menipis
  `, { parse_mode: 'Markdown' });
}

async function handleLaporanCommand(bot: TelegramBot, msg: any) {
  const chatId = msg.chat.id;
  const profileId = authorizedUsers[chatId];

  if (!profileId) {
    await bot.sendMessage(chatId, '❌ Anda belum login. Gunakan /login [kode_bisnis]');
    return;
  }

  try {
    const metrics = await calculateBusinessMetrics(profileId);
    const now = new Date();
    const monthName = now.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    await bot.sendMessage(chatId, `
📊 *LAPORAN KEUANGAN*
🗓 ${monthName}

💰 *Pemasukan:* Rp ${metrics.revenue.toLocaleString('id-ID')}
💸 *Pengeluaran:* Rp ${metrics.expenses.toLocaleString('id-ID')}
💵 *Laba Bersih:* Rp ${metrics.netProfit.toLocaleString('id-ID')}

📦 *Total Produk:* ${metrics.totalProducts}
🛍️ *Transaksi:* ${metrics.transactionCount}

${metrics.netProfit > 0 ? '✅ Bisnis sedang untung!' : '⚠️ Perlu perhatian pada pengeluaran'}
    `, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error in laporan command:', error);
    await bot.sendMessage(chatId, '❌ Gagal mengambil laporan. Coba lagi nanti.');
  }
}

async function handleTransaksiMasukCommand(bot: TelegramBot, msg: any) {
  const chatId = msg.chat.id;
  const profileId = authorizedUsers[chatId];

  if (!profileId) {
    await bot.sendMessage(chatId, '❌ Anda belum login. Gunakan /login [kode_bisnis]');
    return;
  }

  const { data: transactions } = await supabase
    .from('umkm_transactions')
    .select('*')
    .eq('profile_id', profileId)
    .eq('type', 'in')
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);

  if (!transactions || transactions.length === 0) {
    await bot.sendMessage(chatId, '📭 Belum ada transaksi masuk.');
    return;
  }

  let message = '💰 *10 TRANSAKSI MASUK TERAKHIR*\n\n';
  transactions.forEach((t, i) => {
    const date = new Date(t.transaction_date).toLocaleDateString('id-ID');
    message += `${i + 1}. ${date}\n   Rp ${t.amount.toLocaleString('id-ID')}\n   ${t.description}\n\n`;
  });

  await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

async function handleTransaksiKeluarCommand(bot: TelegramBot, msg: any) {
  const chatId = msg.chat.id;
  const profileId = authorizedUsers[chatId];

  if (!profileId) {
    await bot.sendMessage(chatId, '❌ Anda belum login. Gunakan /login [kode_bisnis]');
    return;
  }

  const { data: transactions } = await supabase
    .from('umkm_transactions')
    .select('*')
    .eq('profile_id', profileId)
    .eq('type', 'out')
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);

  if (!transactions || transactions.length === 0) {
    await bot.sendMessage(chatId, '📭 Belum ada transaksi keluar.');
    return;
  }

  let message = '💸 *10 TRANSAKSI KELUAR TERAKHIR*\n\n';
  transactions.forEach((t, i) => {
    const date = new Date(t.transaction_date).toLocaleDateString('id-ID');
    message += `${i + 1}. ${date}\n   Rp ${t.amount.toLocaleString('id-ID')}\n   ${t.description}\n\n`;
  });

  await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

async function handleKomentarCommand(bot: TelegramBot, msg: any) {
  const chatId = msg.chat.id;
  const profileId = authorizedUsers[chatId];

  if (!profileId) {
    await bot.sendMessage(chatId, '❌ Anda belum login. Gunakan /login [kode_bisnis]');
    return;
  }

  const text = msg.text || '';
  const comment = text.replace('/komentar', '').trim();

  if (!comment) {
    await bot.sendMessage(chatId, '❌ Format: /komentar [pesan]\n\nContoh: /komentar Stok tepung menipis');
    return;
  }

  try {
    await supabase.from('umkm_evaluations').insert([{
      profile_id: profileId,
      telegram_chat_id: chatId.toString(),
      message: comment,
      status: 'unread'
    }]);

    await bot.sendMessage(chatId, 
      '✅ *Evaluasi terkirim ke admin!*\n\nTim akan segera membaca pesan Anda.',
      { parse_mode: 'Markdown' }
    );
  } catch (error) {
    console.error('Error saving evaluation:', error);
    await bot.sendMessage(chatId, '❌ Gagal mengirim evaluasi. Coba lagi nanti.');
  }
}
