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
// HANDLER FUNCTIONS
// ============================================

async function handleLaporanCommand(msg: TelegramBot.Message) {
  if (!bot) return;
  
  const chatId = msg.chat.id;
  const profileId = authorizedUsers[chatId];

  if (!profileId) {
    await bot.sendMessage(chatId, '❌ Anda belum login! Gunakan /login [kode_bisnis]');
    return;
  }

  await bot.sendMessage(chatId, '⏳ Sedang menghasilkan laporan...');

  try {
    // Get current month/year
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Get ALL transactions for this profile (not just current month)
    const { data: allTransactions, error: allError } = await supabase
      .from('umkm_transactions')
      .select('*')
      .eq('profile_id', profileId)
      .order('transaction_date', { ascending: false });

    if (allError) throw allError;

    // Get transactions for current month
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
    
    const transactions = allTransactions?.filter(t => {
      const tDate = t.transaction_date;
      return tDate >= startDate && tDate < endDate;
    }) || [];

    console.log(`📊 Laporan - Profile: ${profileId}, Total: ${allTransactions?.length}, Bulan ini: ${transactions.length}`);

    // Calculate totals
    const totalIncome = transactions
      ?.filter(t => t.type === 'in')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const totalExpense = transactions
      ?.filter(t => t.type === 'out')
      .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

    const balance = totalIncome - totalExpense;

    // Get profile
    const { data: profile } = await supabase
      .from('umkm_profiles')
      .select('business_name')
      .eq('id', profileId)
      .single();

    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];

    // Count transaction types
    const incomeTransactions = transactions.filter(t => t.type === 'in');
    const expenseTransactions = transactions.filter(t => t.type === 'out');

    let report = `
📊 *LAPORAN KEUANGAN*
${profile?.business_name || 'UMKM'}

📅 Periode: ${monthNames[month - 1]} ${year}

💰 *RINGKASAN:*
• Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')} (${incomeTransactions.length}x)
• Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')} (${expenseTransactions.length}x)
• Saldo: Rp ${balance.toLocaleString('id-ID')}
• Total Transaksi: ${transactions.length}

${balance >= 0 ? '✅ Bisnis untung!' : '⚠️ Perlu perhatian!'}
`;

    // Add recent transactions summary
    if (transactions.length > 0) {
      report += '\n📝 *Transaksi Terbaru:*\n';
      const recent = transactions.slice(0, 5);
      recent.forEach((t, i) => {
        const date = new Date(t.transaction_date);
        const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
        const type = t.type === 'in' ? '📥' : '📤';
        report += `${i + 1}. ${type} ${dateStr} - Rp ${Number(t.amount).toLocaleString('id-ID')}\n`;
      });
      
      if (transactions.length > 5) {
        report += `\n_... dan ${transactions.length - 5} transaksi lainnya_\n`;
      }
    }

    report += '\n_Untuk laporan lengkap, akses dashboard admin._';

    await bot.sendMessage(chatId, report, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Error generating report:', error);
    await bot.sendMessage(chatId, '❌ Gagal menghasilkan laporan. Coba lagi nanti.');
  }
}

async function handleRingkasanCommand(msg: TelegramBot.Message) {
  if (!bot) return;
  
  const chatId = msg.chat.id;
  const profileId = authorizedUsers[chatId];

  if (!profileId) {
    await bot.sendMessage(chatId, '❌ Anda belum login! Gunakan /login [kode_bisnis]');
    return;
  }

  await bot.sendMessage(chatId, '⏳ Mengambil data bisnis...');

  try {
    // Get business metrics
    const metrics = await calculateBusinessMetrics(profileId);

    // Get profile
    const { data: profile } = await supabase
      .from('umkm_profiles')
      .select('business_name, category')
      .eq('id', profileId)
      .single();

    // Get products count
    const { data: products } = await supabase
      .from('umkm_products')
      .select('id, stock')
      .eq('profile_id', profileId);

    const lowStockCount = products?.filter(p => Number(p.stock) > 0 && Number(p.stock) < 10).length || 0;
    const outOfStockCount = products?.filter(p => Number(p.stock) === 0).length || 0;

    const summary = `
💼 *RINGKASAN BISNIS*
${profile?.business_name || 'UMKM'}

🏪 Kategori: ${profile?.category || '-'}

📊 *KEUANGAN:*
• Total Pemasukan: Rp ${metrics.totalIncome.toLocaleString('id-ID')}
• Total Pengeluaran: Rp ${metrics.totalExpense.toLocaleString('id-ID')}
• Saldo: Rp ${metrics.balance.toLocaleString('id-ID')}

📦 *INVENTORY:*
• Total Produk: ${metrics.productCount}
• Stok Menipis: ${lowStockCount} produk
• Habis Stok: ${outOfStockCount} produk

${metrics.balance >= 0 ? '💚 Bisnis sehat!' : '⚠️ Perlu evaluasi!'}
${lowStockCount > 0 ? `\n⚠️ ${lowStockCount} produk perlu restock!` : ''}

_Update real-time dari dashboard admin._
    `;

    await bot.sendMessage(chatId, summary, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Error generating summary:', error);
    await bot.sendMessage(chatId, '❌ Gagal mengambil data bisnis. Coba lagi nanti.');
  }
}

async function handleTransaksiMasukCommand(msg: TelegramBot.Message) {
  if (!bot) return;
  
  const chatId = msg.chat.id;
  const profileId = authorizedUsers[chatId];

  if (!profileId) {
    await bot.sendMessage(chatId, '❌ Anda belum login! Gunakan /login [kode_bisnis]');
    return;
  }

  await bot.sendMessage(chatId, '⏳ Mengambil transaksi masuk...');

  try {
    // Get income transactions (latest 10)
    const { data: transactions, error } = await supabase
      .from('umkm_transactions')
      .select('*')
      .eq('profile_id', profileId)
      .eq('type', 'in')
      .order('transaction_date', { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!transactions || transactions.length === 0) {
      await bot.sendMessage(chatId, '📥 Belum ada transaksi pemasukan.');
      return;
    }

    // Calculate total
    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    // Format transactions list
    let message = `📥 *TRANSAKSI MASUK* (10 Terbaru)\n\n`;
    
    transactions.forEach((t, index) => {
      const date = new Date(t.transaction_date);
      const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      message += `${index + 1}. *${dateStr}*\n`;
      message += `   💰 Rp ${Number(t.amount).toLocaleString('id-ID')}\n`;
      if (t.description) {
        message += `   📝 ${t.description}\n`;
      }
      message += `\n`;
    });

    message += `\n✅ *Total Pemasukan:* Rp ${total.toLocaleString('id-ID')}`;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Error fetching income transactions:', error);
    await bot.sendMessage(chatId, '❌ Gagal mengambil data transaksi. Coba lagi nanti.');
  }
}

async function handleTransaksiKeluarCommand(msg: TelegramBot.Message) {
  if (!bot) return;
  
  const chatId = msg.chat.id;
  const profileId = authorizedUsers[chatId];

  if (!profileId) {
    await bot.sendMessage(chatId, '❌ Anda belum login! Gunakan /login [kode_bisnis]');
    return;
  }

  await bot.sendMessage(chatId, '⏳ Mengambil transaksi keluar...');

  try {
    // Get expense transactions (latest 10)
    const { data: transactions, error } = await supabase
      .from('umkm_transactions')
      .select('*')
      .eq('profile_id', profileId)
      .eq('type', 'out')
      .order('transaction_date', { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!transactions || transactions.length === 0) {
      await bot.sendMessage(chatId, '📤 Belum ada transaksi pengeluaran.');
      return;
    }

    // Calculate total
    const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

    // Format transactions list
    let message = `📤 *TRANSAKSI KELUAR* (10 Terbaru)\n\n`;
    
    transactions.forEach((t, index) => {
      const date = new Date(t.transaction_date);
      const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      message += `${index + 1}. *${dateStr}*\n`;
      message += `   💸 Rp ${Number(t.amount).toLocaleString('id-ID')}\n`;
      if (t.description) {
        message += `   📝 ${t.description}\n`;
      }
      message += `\n`;
    });

    message += `\n💳 *Total Pengeluaran:* Rp ${total.toLocaleString('id-ID')}`;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Error fetching expense transactions:', error);
    await bot.sendMessage(chatId, '❌ Gagal mengambil data transaksi. Coba lagi nanti.');
  }
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
  if (!bot) {
    console.error('Bot not initialized for webhook');
    return;
  }

  // Process the update
  try {
    // Telegram sends different types of updates
    if (update.message) {
      await bot.processUpdate(update);
    } else if (update.callback_query) {
      await bot.processUpdate(update);
    } else {
      console.log('Unknown update type:', Object.keys(update));
    }
  } catch (error) {
    console.error('Error processing webhook update:', error);
    throw error;
  }
}
