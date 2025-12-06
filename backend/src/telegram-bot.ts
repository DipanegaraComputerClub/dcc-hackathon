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
const bot = TELEGRAM_BOT_TOKEN ? new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true }) : null;

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
        [{ text: '📝 Kirim Evaluasi' }, { text: '📈 Laporan Custom' }],
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
      
      case '📝 Kirim Evaluasi':
        await bot.sendMessage(chatId, 
          '📝 *Kirim Evaluasi*\n\nKetik evaluasi Anda, lalu saya akan menyimpannya untuk tim admin.\n\nFormat:\n`/evaluasi [pesan evaluasi Anda]`\n\nContoh:\n`/evaluasi Penjualan bulan ini bagus, tingkatkan produksi!`',
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
/laporan [bulan] [tahun] - Laporan custom
/ringkasan - Ringkasan bisnis
/evaluasi [pesan] - Kirim evaluasi
/logout - Keluar

*Tips:*
• Gunakan tombol keyboard untuk akses cepat
• Laporan otomatis untuk bulan berjalan
• Evaluasi akan dikirim ke dashboard admin
        `, { parse_mode: 'Markdown' });
        break;
      
      case '🚪 Logout':
        delete authorizedUsers[chatId];
        await bot.sendMessage(chatId, '✅ Anda telah logout. Gunakan /login untuk masuk lagi.');
        break;
    }
  });

  // /evaluasi [message] - Send evaluation to admin
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
      // Save evaluation to database
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

      if (error) throw error;

      await bot.sendMessage(chatId, 
        '✅ *Evaluasi terkirim!*\n\nTim admin akan melihat evaluasi Anda di dashboard.',
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      console.error('Error saving evaluation:', error);
      await bot.sendMessage(chatId, '❌ Gagal mengirim evaluasi. Coba lagi nanti.');
    }
  });

  // /ringkasan - Business summary
  bot.onText(/\/ringkasan/, async (msg) => {
    await handleRingkasanCommand(msg);
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

    // Get transactions for current month
    const { data: transactions, error } = await supabase
      .from('umkm_transactions')
      .select('*')
      .eq('profile_id', profileId)
      .gte('transaction_date', `${year}-${month.toString().padStart(2, '0')}-01`)
      .lt('transaction_date', `${month === 12 ? year + 1 : year}-${month === 12 ? '01' : (month + 1).toString().padStart(2, '0')}-01`)
      .order('transaction_date', { ascending: false });

    if (error) throw error;

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

    const report = `
📊 *LAPORAN KEUANGAN*
${profile?.business_name || 'UMKM'}

📅 Periode: ${monthNames[month - 1]} ${year}

💰 *RINGKASAN:*
• Pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}
• Pengeluaran: Rp ${totalExpense.toLocaleString('id-ID')}
• Saldo: Rp ${balance.toLocaleString('id-ID')}
• Total Transaksi: ${transactions?.length || 0}

${balance >= 0 ? '✅ Bisnis untung!' : '⚠️ Perlu perhatian!'}

_Untuk laporan lengkap, akses dashboard admin._
    `;

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
